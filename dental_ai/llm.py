"""Kết nối Claude API để sinh câu trả lời.

- Model mặc định: claude-opus-5-5, adaptive thinking (luôn bật trên model này),
  độ sâu suy luận điều chỉnh qua output_config.effort.
- Streaming để không bị timeout với câu trả lời dài.
- Bật server-side fallback ("default"): nếu bộ lọc an toàn từ chối nhầm một câu hỏi
  y khoa hợp lệ, API tự chạy lại trên model dự phòng phù hợp.
- System prompt (file 04 + quy tắc vận hành) được cache để giảm chi phí.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Iterator

import anthropic
from pydantic import BaseModel

from .config import Settings, get_settings

log = logging.getLogger(__name__)

FALLBACK_BETA = "server-side-fallback-2026-07-01"

# Quy tắc vận hành bổ sung cho system prompt 04 (không sửa file gốc của bác sĩ).
OPERATING_RULES = """

-----

## 4. QUY TẮC VẬN HÀNH HỆ THỐNG (BẮT BUỘC — ƯU TIÊN CAO NHẤT KHI CÓ XUNG ĐỘT)

1. **Bám sát dữ liệu truy xuất:** Mỗi lượt hỏi, hệ thống gửi kèm khối `<ngu_canh_truy_xuat>` gồm các phác đồ từ Golden Hybrid Dental RAG Database và (nếu có) bài báo PubMed tự động truy xuất. Số liệu định lượng (Ncm, mm, mg, %, tỷ lệ sống còn…) và trích dẫn CHỈ được lấy từ khối này. Kiến thức nền chung của bạn chỉ dùng để giải thích, liên kết ý; khi dùng phải ghi rõ "(kiến thức nền, chưa có trong cơ sở dữ liệu)".
2. **Không bịa trích dẫn:** Tuyệt đối không tạo ra DOI, PMID, tên tác giả, năm xuất bản hay tên hướng dẫn không có trong ngữ cảnh. Thẻ trích dẫn dùng đúng định dạng `[Tổ chức | Năm | Mức bằng chứng]` lấy từ ngữ cảnh.
3. **Khi dữ liệu không đủ:** Nói rõ cơ sở dữ liệu hiện chưa có phác đồ cho vấn đề này, chỉ đưa thông tin chung an toàn và khuyên khám trực tiếp. Không suy đoán phác đồ điều trị cụ thể.
4. **Chế độ được hệ thống chỉ định:** Dòng `CHẾ ĐỘ:` trong tin nhắn cho biết Chế độ A (bác sĩ) hay Chế độ B (bệnh nhân) đã được xác định — tuân theo đúng cấu trúc trả lời của chế độ đó.
5. **Với bệnh nhân (Chế độ B):** Không chẩn đoán xác định, không kê đơn thuốc kê toa/liều kháng sinh, không đưa thông số phẫu thuật. Có thể giải thích các phương án điều trị và luôn khuyến khích thăm khám. Xưng hô "anh/chị", giọng ấm áp.
6. **Dấu hiệu cấp cứu:** Nếu hệ thống báo `CẢNH BÁO ĐỎ`, mở đầu câu trả lời bằng lời khuyên đi khám/cấp cứu phù hợp, ngắn gọn và rõ ràng.
7. **Ngôn ngữ:** Trả lời bằng tiếng Việt (giữ thuật ngữ tiếng Anh trong ngoặc khi cần). Dùng Markdown với tiêu đề, gạch đầu dòng, bảng so sánh khi đối chiếu y văn.
8. **Phạm vi:** Chỉ tư vấn trong lĩnh vực Răng Hàm Mặt và sức khoẻ liên quan. Từ chối lịch sự các yêu cầu ngoài phạm vi.
"""


@dataclass
class LLMResult:
    text: str = ""
    stop_reason: str | None = None
    model: str | None = None
    refused: bool = False
    usage: dict = field(default_factory=dict)


class PubMedQuery(BaseModel):
    """Truy vấn PubMed tiếng Anh sinh từ câu hỏi tiếng Việt."""

    english_keywords: str
    is_dental_question: bool


def load_system_prompt(settings: Settings | None = None) -> str:
    s = settings or get_settings()
    return s.system_prompt_path.read_text(encoding="utf-8") + OPERATING_RULES


class ClaudeClient:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        if not self.settings.anthropic_api_key:
            raise RuntimeError("Chưa cấu hình ANTHROPIC_API_KEY trong file .env")
        self.client = anthropic.Anthropic(api_key=self.settings.anthropic_api_key, max_retries=3)
        self.system_blocks = [{
            "type": "text",
            "text": load_system_prompt(self.settings),
            "cache_control": {"type": "ephemeral"},
        }]

    @property
    def model(self) -> str:
        return self.settings.claude_model

    def stream_answer(self, messages: list[dict], effort: str) -> Iterator[str | LLMResult]:
        """Phát từng đoạn văn bản (str); phần tử cuối cùng là LLMResult."""
        result = LLMResult()
        with self.client.beta.messages.stream(
            model=self.model,
            max_tokens=self.settings.claude_max_tokens,
            system=self.system_blocks,
            messages=messages,
            thinking={"type": "adaptive"},
            output_config={"effort": effort},
            betas=[FALLBACK_BETA],
            fallbacks="default",
        ) as stream:
            for text in stream.text_stream:
                result.text += text
                yield text
            final = stream.get_final_message()
        result.stop_reason = final.stop_reason
        result.model = final.model
        result.refused = final.stop_reason == "refusal"
        u = final.usage
        result.usage = {
            "input_tokens": u.input_tokens,
            "output_tokens": u.output_tokens,
            "cache_read_input_tokens": getattr(u, "cache_read_input_tokens", 0) or 0,
        }
        if result.refused:
            log.warning("Claude từ chối trả lời: %s", final.stop_details)
        elif final.stop_reason == "max_tokens":
            log.warning("Câu trả lời bị cắt do chạm max_tokens=%s", self.settings.claude_max_tokens)
        yield result

    def build_pubmed_query(self, question: str) -> PubMedQuery | None:
        """Chuyển câu hỏi tiếng Việt thành từ khoá MeSH/tiếng Anh cho PubMed."""
        try:
            response = self.client.messages.parse(
                model=self.model,
                max_tokens=4000,
                output_config={"effort": "low"},
                output_format=PubMedQuery,
                messages=[{
                    "role": "user",
                    "content": (
                        "Convert this dental question into a concise PubMed boolean query in English "
                        "(2-4 concepts joined with AND, synonyms with OR, use MeSH-style terms, no field tags, "
                        "no date or journal filters). Also say whether it is a dental/oral-health question.\n\n"
                        f"Question: {question}"
                    ),
                }],
            )
        except anthropic.APIError as exc:
            log.warning("Không tạo được truy vấn PubMed: %s", exc)
            return None
        if response.stop_reason == "refusal":
            return None
        return response.parsed_output
