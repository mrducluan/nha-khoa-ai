"""Bóc tách PDF → JSON schema 02 (Claude giả lập ở tầng HTTP)."""

import json
from pathlib import Path

import anthropic
import httpx2

from dental_ai.config import Settings
from dental_ai.extractor import GuidelineExtractor, parse_json_object
from dental_ai.llm import ClaudeClient
from tests.test_llm import fake_stream

SAMPLE = Path(__file__).resolve().parent.parent / "data" / "examples" / "mau_sau_rang_fluoride_ADA2018.json"


def make_extractor(replies, captured):
    queue = list(replies)

    def handler(request):
        captured.append(json.loads(request.content))
        return httpx2.Response(200, content=fake_stream(queue.pop(0)), headers={"content-type": "text/event-stream"})

    llm = ClaudeClient(Settings(anthropic_api_key="sk-test"))
    llm.client = anthropic.Anthropic(api_key="sk-test", http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))
    return GuidelineExtractor(Settings(anthropic_api_key="sk-test"), llm)


def test_parse_json_object_tolerates_fences():
    assert parse_json_object('Đây:\n```json\n{"a": 1}\n```') == {"a": 1}


def test_extract_repairs_invalid_json(tmp_path):
    good = SAMPLE.read_text(encoding="utf-8")
    bad = json.loads(good)
    del bad["pico_evidence_matrix"]
    src = tmp_path / "guideline.txt"
    src.write_text("Nội dung hướng dẫn ADA 2018 về điều trị sâu răng không xâm lấn...", encoding="utf-8")

    captured = []
    result = make_extractor([json.dumps(bad, ensure_ascii=False), good], captured).extract(src, hints="Chỉ lấy phác đồ chính")

    assert result.ok and result.attempts == 2
    first, second = captured
    assert first["messages"][0]["content"][0]["type"] == "document"
    assert "goi_y_cua_bac_si" in first["messages"][0]["content"][1]["text"]
    assert first["fallbacks"] == "default" and first["output_config"]["effort"] == "high"
    # Lượt sửa: lịch sử nối thêm, có phản hồi trước + danh sách lỗi
    assert [m["role"] for m in second["messages"]] == ["user", "assistant", "user"]
    assert "pico_evidence_matrix" in second["messages"][2]["content"]


def test_extract_gives_up_after_max_repairs(tmp_path):
    src = tmp_path / "x.md"
    src.write_text("abc", encoding="utf-8")
    result = make_extractor(["không phải JSON"] * 3, []).extract(src)
    assert not result.ok and result.attempts == 3 and "JSON" in result.errors[0]


def test_pdf_block(tmp_path):
    from dental_ai.extractor import build_source_block

    pdf = tmp_path / "a.pdf"
    pdf.write_bytes(b"%PDF-1.4 test")
    block = build_source_block(pdf)
    assert block["source"]["media_type"] == "application/pdf" and block["source"]["type"] == "base64"
