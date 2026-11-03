import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from dental_ai.assistant import search
from dental_ai.embeddings import LocalHashEmbedder
from dental_ai.knowledge import audit, review, submit_for_review

SAMPLE = Path(__file__).resolve().parent.parent / "data" / "examples" / "mau_sau_rang_fluoride_ADA2018.json"
ADMIN = {"X-Admin-Token": "test-admin-token"}


def test_seed_data_passes_schema_audit(conn):
    report = audit(conn)
    assert len(report) >= 6
    assert all(r["chunks"] >= 5 for r in report)
    assert all(not r["schema_errors"] for r in report), report


def test_review_workflow_then_searchable(conn):
    doc = json.loads(SAMPLE.read_text(encoding="utf-8"))
    doc["protocol_core"]["clinical_topic_slug"] = "review-workflow-test"   # độc lập với các kiểm thử khác
    rid = submit_for_review(conn, doc, "bs-test")
    query = "con tôi bị sâu răng sữa có cần khoan không, bôi fluoride được không"
    # Chưa duyệt → chưa tìm thấy
    assert not any(r["clinical_topic_slug"] == "review-workflow-test"
                   for r in search(conn, LocalHashEmbedder(), query, 10))
    pid = review(conn, LocalHashEmbedder(), rid, True, "BS Trưởng khoa")
    conn.commit()
    assert pid in [r["protocol_id"] for r in search(conn, LocalHashEmbedder(), query, 3)]
    with pytest.raises(ValueError):
        review(conn, LocalHashEmbedder(), rid, True, "x")


@pytest.fixture
def client(database):
    from dental_ai.api import app, get_assistant

    get_assistant.cache_clear()
    return TestClient(app)


def test_health(client):
    h = client.get("/health").json()
    assert h["database"] is True and h["knowledge"]["protocols"] >= 6
    assert h["llm"]["configured"] is False


def test_ask_offline_mode_and_feedback(client):
    r = client.post("/api/ask", json={"question": "Tôi bị chảy máu chân răng, má sưng to và sốt cao", "role": "auto"}).json()
    assert r["mode"] == "PATIENT"
    assert any(f["code"] == "SPREADING_INFECTION" for f in r["red_flags"])
    assert r["sources"][0]["title"].startswith("Phác đồ Điều trị Không Phẫu thuật")
    assert "không thay thế chẩn đoán" in r["answer"]
    assert client.post("/api/feedback", json={"log_id": r["log_id"], "rating": -1, "note": "test"}).status_code == 200


def test_stream_endpoint(client):
    with client.stream("POST", "/api/ask/stream", json={"question": "Torque MUA bao nhiêu Ncm?"}) as resp:
        events = [json.loads(line[5:]) for line in resp.iter_lines() if line.startswith("data:")]
    assert events[0]["type"] == "meta" and events[0]["mode"] == "DOCTOR"
    assert events[-1]["type"] == "done"


def test_admin_requires_token(client):
    assert client.get("/api/admin/reviews").status_code == 401
    assert client.get("/api/admin/reviews", headers=ADMIN).status_code == 200
    bad = client.post("/api/admin/submit", json={"foo": "bar"}, headers=ADMIN)
    assert bad.status_code == 422


def test_off_topic_is_politely_declined(client):
    r = client.post("/api/ask", json={"question": "Giá vàng hôm nay bao nhiêu?"}).json()
    assert r["off_topic"] is True and r["sources"] == [] and "răng hàm mặt" in r["answer"]


def test_follow_up_question_stays_in_scope(client):
    history = [{"role": "user", "content": "Tôi bị chảy máu chân răng khi đánh răng"},
               {"role": "assistant", "content": "..."}]
    r = client.post("/api/ask", json={"question": "Còn nếu tôi bị tiểu đường thì sao?", "history": history}).json()
    assert r["off_topic"] is False
    assert any(c["code"] == "DIABETES" for c in r["cautions"])
    assert r["sources"] and "Nha chu" in r["sources"][0]["title"]


def test_uncovered_topic_is_honest_offline(client):
    r = client.post("/api/ask", json={"question": "Lưỡi bản đồ có nguy hiểm không?"}).json()
    assert r["uncovered"] and r["sources"] == []
    assert "chưa có phác đồ" in r["answer"]


def test_new_topic_after_history_is_not_merged(client):
    """Câu mới có chủ đề riêng KHÔNG bị ghép với câu trước; câu ngoài lề vẫn bị từ chối dù có lịch sử."""
    history = [{"role": "user", "content": "Tôi đang mang thai, chảy máu lợi khi đánh răng"},
               {"role": "assistant", "content": "..."}]
    r = client.post("/api/ask", json={"question": "Lưỡi bản đồ có nguy hiểm không?", "history": history}).json()
    assert r["sources"] == [] and r["uncovered"]
    r = client.post("/api/ask", json={"question": "Giá vàng hôm nay bao nhiêu?", "history": history}).json()
    assert r["off_topic"] is True


def test_is_follow_up():
    from dental_ai.assistant import is_follow_up

    prev = "Tôi bị chảy máu chân răng"
    assert is_follow_up("Còn nếu tôi bị tiểu đường thì sao?", prev)
    assert is_follow_up("vậy bao lâu thì khỏi", prev)
    assert not is_follow_up("Niềng răng có đau không", prev)        # chủ đề riêng
    assert not is_follow_up("Giá vàng hôm nay bao nhiêu?", prev)     # không phải nối tiếp
