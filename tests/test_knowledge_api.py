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
    rid = submit_for_review(conn, doc, "bs-test")
    # Chưa duyệt → chưa tìm thấy
    assert not any(r["clinical_topic_slug"] == "nonrestorative-caries-management-fluoride-sdf"
                   for r in search(conn, LocalHashEmbedder(), "bôi fluoride sâu răng sữa SDF", 5))
    pid = review(conn, LocalHashEmbedder(), rid, True, "BS Trưởng khoa")
    conn.commit()
    rows = search(conn, LocalHashEmbedder(), "con tôi bị sâu răng sữa có cần khoan không, bôi fluoride được không", 3)
    assert rows[0]["protocol_id"] == pid
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
