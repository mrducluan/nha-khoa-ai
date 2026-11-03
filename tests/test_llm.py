"""Kiểm tra request gửi tới Claude API ở tầng HTTP (không cần API key thật)."""

import json

import anthropic
import httpx2 as httpx

from dental_ai.assistant import Assistant
from dental_ai.config import Settings
from dental_ai.embeddings import LocalHashEmbedder
from dental_ai.llm import ClaudeClient, LLMResult


def sse(events):
    return "".join(f"event: {e['type']}\ndata: {json.dumps(e)}\n\n" for e in events).encode()


def fake_stream(text, stop_reason="end_turn"):
    return sse([
        {"type": "message_start", "message": {"id": "msg_1", "type": "message", "role": "assistant",
         "model": "claude-opus-5-5", "content": [], "stop_reason": None, "stop_sequence": None,
         "usage": {"input_tokens": 10, "output_tokens": 0}}},
        {"type": "content_block_start", "index": 0, "content_block": {"type": "text", "text": ""}},
        {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": text}},
        {"type": "content_block_stop", "index": 0},
        {"type": "message_delta", "delta": {"stop_reason": stop_reason, "stop_sequence": None},
         "usage": {"output_tokens": 5}},
        {"type": "message_stop"},
    ])


def make_client(captured, text="Xin chào", stop_reason="end_turn"):
    def handler(request: httpx.Request):
        captured.append({"headers": dict(request.headers), "body": json.loads(request.content)})
        return httpx.Response(200, content=fake_stream(text, stop_reason),
                              headers={"content-type": "text/event-stream"})

    client = ClaudeClient(Settings(anthropic_api_key="sk-test"))
    client.client = anthropic.Anthropic(api_key="sk-test", http_client=httpx.Client(transport=httpx.MockTransport(handler)))
    return client


def test_request_shape():
    captured = []
    out = list(make_client(captured).stream_answer([{"role": "user", "content": "hi"}], "high"))
    body, headers = captured[0]["body"], captured[0]["headers"]
    assert body["model"] == "claude-opus-5-5"
    assert body["thinking"] == {"type": "adaptive"}
    assert body["output_config"] == {"effort": "high"}
    assert body["fallbacks"] == "default"
    assert "server-side-fallback-2026-07-01" in headers["anthropic-beta"]
    assert body["system"][0]["cache_control"] == {"type": "ephemeral"}
    assert "QUY TẮC VẬN HÀNH" in body["system"][0]["text"]
    assert out[0] == "Xin chào" and isinstance(out[-1], LLMResult) and not out[-1].refused


def test_refusal_is_reported():
    out = list(make_client([], "", "refusal").stream_answer([{"role": "user", "content": "x"}], "medium"))
    assert out[-1].refused


def test_assistant_sends_context_and_mode(database):
    captured = []
    settings = Settings(anthropic_api_key="sk-test", database_url=database, fallback_enabled=False)
    assistant = Assistant(settings, LocalHashEmbedder(), make_client(captured, "Trả lời mẫu"))
    result = assistant.ask("Thủng màng Schneider 7mm xử trí thế nào?", "doctor",
                           history=[{"role": "user", "content": "chào"}, {"role": "assistant", "content": "Chào bác sĩ"}])
    msg = captured[0]["body"]["messages"][-1]["content"]
    assert "CHẾ ĐỘ: A" in msg and "<ngu_canh_truy_xuat>" in msg and "Schneider" in msg
    assert len(captured[0]["body"]["messages"]) == 3
    assert captured[0]["body"]["output_config"]["effort"] == "high"
    assert result["answer"].startswith("Trả lời mẫu")


def test_assistant_tells_claude_about_cautions_and_gaps(database):
    captured = []
    settings = Settings(anthropic_api_key="sk-test", database_url=database, fallback_enabled=False)
    assistant = Assistant(settings, LocalHashEmbedder(), make_client(captured, "ok"))
    assistant.ask("Tôi đang mang thai 5 tháng, bị lưỡi bản đồ và muốn cạo vôi được không, giá bao nhiêu?", "patient")
    msg = captured[0]["body"]["messages"][-1]["content"]
    assert "ĐỐI TƯỢNG ĐẶC BIỆT" in msg and "Thai kỳ" in msg
    assert "CHƯA CÓ PHÁC ĐỒ" in msg and "lưỡi bản đồ" in msg
    assert "KHÔNG CÓ DỮ LIỆU GIÁ" in msg
    assert "QUY TẮC VẬN HÀNH" in captured[0]["body"]["system"][0]["text"]
