"""Bóc tách tài liệu (PDF hướng dẫn ADA/ITI/EFP…, hoặc văn bản) thành JSON chuẩn schema 02 bằng Claude.

Quy trình:  PDF ──► Claude đọc toàn văn ──► JSON ──► kiểm định schema 02
                                             ▲                │ lỗi
                                             └── tự sửa ◄─────┘ (tối đa 2 lần)
Kết quả KHÔNG lên hệ thống ngay: được đưa vào hàng chờ duyệt để bác sĩ đối chiếu.
"""

from __future__ import annotations

import base64
import json
import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from .config import ROOT_DIR, Settings, get_settings
from .llm import FALLBACK_BETA, ClaudeClient
from .validation import validate_document

log = logging.getLogger(__name__)

MAX_PDF_BYTES = 30 * 1024 * 1024
MAX_REPAIRS = 2
EXAMPLE_PATH = ROOT_DIR / "data" / "examples" / "mau_sau_rang_fluoride_ADA2018.json"

EXTRACTION_INSTRUCTIONS = """Bạn là chuyên gia biên tập tri thức nha khoa thực chứng. Nhiệm vụ: bóc tách tài liệu đính kèm
thành MỘT đối tượng JSON tuân thủ chính xác JSON Schema bên dưới (DentalAcademicPDFIngestionSchema).

QUY TẮC BẮT BUỘC:
1. Chỉ dùng thông tin CÓ TRONG TÀI LIỆU. Không bổ sung số liệu, liều lượng, tỷ lệ, DOI, tác giả hay năm từ trí nhớ.
   Trường văn bản không có trong tài liệu: ghi "Không nêu trong tài liệu". Mảng không có dữ liệu: để [].
2. Giữ nguyên số liệu định lượng (Ncm, mm, mg, %, khoảng tin cậy, mức khuyến nghị) đúng như văn bản gốc.
3. Nội dung lâm sàng viết bằng tiếng Việt chuyên ngành, giữ thuật ngữ tiếng Anh trong ngoặc đơn khi cần.
   patient_friendly_translation viết bằng ngôn ngữ đời thường, ấm áp, dễ hiểu cho bệnh nhân.
4. organization_code, authority_tier, evidence_level, primary_specialty, chunk_section_type phải nằm trong enum của schema.
   Tier: ADA/ITI = TIER_1_GOLD_STANDARD; FDI/CGDent/EFP/AAP/EAO/AAID/ICOI = TIER_2_INTERNATIONAL_GUIDE; còn lại TIER_3_PEER_REVIEWED.
5. clinical_topic_slug: chữ thường tiếng Anh nối bằng gạch ngang, mô tả chủ đề (VD: immediate-implant-esthetic-zone).
6. contextualized_child_chunks: 3–8 đoạn, mỗi đoạn BẮT ĐẦU bằng header đúng mẫu
   "[CHUYÊN KHOA: <chuyên khoa> | NGUỒN: <tổ chức> <năm> | CHỐNG CHỈ ĐỊNH CỐT LÕI: <tóm tắt>] <nội dung>".
7. Nếu tài liệu chứa nhiều phác đồ, chọn phác đồ chính (hoặc phác đồ được chỉ định trong GỢI Ý).
8. Chỉ trả về JSON thuần, không kèm giải thích, không bọc trong ```.
"""


@dataclass
class ExtractionResult:
    document: dict[str, Any] | None
    errors: list[str] = field(default_factory=list)
    attempts: int = 0
    raw_text: str = ""

    @property
    def ok(self) -> bool:
        return self.document is not None and not self.errors


def parse_json_object(text: str) -> dict[str, Any]:
    """Lấy đối tượng JSON từ phản hồi (chịu được ```json … ``` hoặc chữ thừa ở hai đầu)."""
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end <= start:
        raise ValueError("Phản hồi không chứa đối tượng JSON")
    return json.loads(text[start : end + 1])


def build_source_block(path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    if path.suffix.lower() == ".pdf":
        if len(data) > MAX_PDF_BYTES:
            raise ValueError(f"PDF quá lớn ({len(data) / 1e6:.1f} MB > 30 MB). Hãy tách thành các phần nhỏ hơn.")
        return {"type": "document", "title": path.name,
                "source": {"type": "base64", "media_type": "application/pdf",
                           "data": base64.standard_b64encode(data).decode()}}
    return {"type": "document", "title": path.name,
            "source": {"type": "text", "media_type": "text/plain", "data": data.decode("utf-8", errors="replace")}}


class GuidelineExtractor:
    def __init__(self, settings: Settings | None = None, llm: ClaudeClient | None = None):
        self.settings = settings or get_settings()
        self.llm = llm or ClaudeClient(self.settings)

    def _first_message(self, source_block: dict[str, Any], hints: str | None) -> dict[str, Any]:
        schema = self.settings.ingestion_schema_path.read_text(encoding="utf-8")
        example = EXAMPLE_PATH.read_text(encoding="utf-8")
        text = (f"{EXTRACTION_INSTRUCTIONS}\n<json_schema>\n{schema}\n</json_schema>\n\n"
                f"<vi_du_dau_ra_hop_le>\n{example}\n</vi_du_dau_ra_hop_le>\n")
        if hints:
            text += f"\n<goi_y_cua_bac_si>\n{hints}\n</goi_y_cua_bac_si>\n"
        text += "\nHãy bóc tách tài liệu đính kèm thành JSON."
        return {"role": "user", "content": [source_block, {"type": "text", "text": text}]}

    def _call(self, messages: list[dict[str, Any]]):
        with self.llm.client.beta.messages.stream(
            model=self.settings.claude_model,
            max_tokens=64000,
            messages=messages,
            thinking={"type": "adaptive"},
            output_config={"effort": "high"},
            betas=[FALLBACK_BETA],
            fallbacks="default",
        ) as stream:
            return stream.get_final_message()

    def extract(self, path: str | Path, hints: str | None = None) -> ExtractionResult:
        path = Path(path)
        messages: list[dict[str, Any]] = [self._first_message(build_source_block(path), hints)]
        result = ExtractionResult(None)
        for attempt in range(1, MAX_REPAIRS + 2):
            result.attempts = attempt
            final = self._call(messages)
            if final.stop_reason == "refusal":
                result.errors = ["Claude từ chối xử lý tài liệu này"]
                return result
            text = "".join(b.text for b in final.content if b.type == "text")
            result.raw_text = text
            if final.stop_reason == "max_tokens":
                result.errors = ["Phản hồi bị cắt do quá dài — hãy tách tài liệu hoặc chỉ định 1 phác đồ trong gợi ý"]
                return result
            try:
                doc = parse_json_object(text)
                errors = validate_document(doc)
            except (ValueError, json.JSONDecodeError) as exc:
                doc, errors = None, [f"JSON không đọc được: {exc}"]
            result.document, result.errors = doc, errors
            if not errors:
                return result
            log.info("Lần %s: %s lỗi schema, yêu cầu Claude sửa", attempt, len(errors))
            # Lịch sử chỉ nối thêm (append-only): giữ nguyên nội dung phản hồi trước, kể cả thinking blocks
            messages.append({"role": "assistant", "content": final.content})
            messages.append({"role": "user", "content": (
                "JSON chưa hợp lệ theo schema. Sửa các lỗi sau và trả lại TOÀN BỘ JSON đã sửa "
                "(vẫn chỉ dùng thông tin trong tài liệu):\n- " + "\n- ".join(errors[:40]))})
        return result
