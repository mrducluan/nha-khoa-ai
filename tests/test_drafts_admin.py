"""Bản nháp tri thức mới + trang quản trị."""

import glob
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from dental_ai.assistant import search
from dental_ai.embeddings import LocalHashEmbedder
from dental_ai.knowledge import load_json, review, submit_for_review
from dental_ai.validation import validate_document

ROOT = Path(__file__).resolve().parent.parent
DRAFTS = sorted(glob.glob(str(ROOT / "data" / "knowledge_drafts" / "*.json")))
ADMIN = {"X-Admin-Token": "test-admin-token"}


@pytest.mark.parametrize("path", DRAFTS)
def test_drafts_are_valid(path):
    assert validate_document(load_json(path)) == []


def test_drafts_answer_new_topics_after_approval(conn):
    for path in DRAFTS:
        rid = submit_for_review(conn, load_json(path), "test")
        review(conn, LocalHashEmbedder(), rid, True, "BS test")
    conn.commit()
    cases = [
        ("Răng khôn mọc ngầm không đau có nên nhổ không?", "asymptomatic-impacted-third-molar-removal-vs-retention"),
        ("Đau nhức răng dữ dội có cần uống kháng sinh không?", "antibiotic-use-pulpal-periapical-dental-pain-swelling"),
        ("Nhổ răng 8 mọc lệch có nguy cơ tê môi không", "asymptomatic-impacted-third-molar-removal-vs-retention"),
        ("Mất răng lâu không trồng lại thì răng bên cạnh có bị nghiêng không", "tooth-loss-drifting-tipping-overeruption"),
        ("Răng hàm trên bị trồi xuống chỗ răng dưới đã nhổ", "tooth-loss-drifting-tipping-overeruption"),
        ("Răng sứ kim loại bị đen viền nướu", "metal-ceramic-vs-all-ceramic-crown-grey-margin"),
        ("Răng đã chữa tủy có cần bọc sứ không", "root-filled-tooth-crown-vs-filling"),
        ("Chọn màu răng và dáng răng theo khuôn mặt", "tooth-shade-selection-smile-design-facial-esthetics"),
        ("Implant bị viêm chảy máu có mủ", "peri-implant-mucositis-peri-implantitis-treatment"),
        ("Thay khớp gối có cần uống kháng sinh trước khi nhổ răng", "antibiotic-prophylaxis-prosthetic-joint-endocarditis"),
        ("Ngủ hay nghiến răng ken két", "sleep-awake-bruxism-assessment-management"),
        ("Tẩy trắng răng có hại men không", "tooth-whitening-bleaching-safety-efficacy"),
        ("Răng ê buốt khi uống nước lạnh", "dentin-hypersensitivity-desensitizing-management"),
        ("Làm cầu răng sứ có phải mài răng bên cạnh", "tooth-supported-fixed-bridge-fdp"),
        ("Nhiệt miệng tái đi tái lại", "recurrent-aphthous-stomatitis-mouth-ulcers"),
        ("Hàm kêu lục cục, đau khớp thái dương hàm", "temporomandibular-disorders-dc-tmd-conservative"),
        ("Đang uống Fosamax có nhổ răng được không", "medication-related-osteonecrosis-jaw-mronj"),
        ("Mảng trắng trong má không cạo được", "oral-potentially-malignant-disorders-cancer-detection"),
    ]
    for question, slug in cases:
        rows = search(conn, LocalHashEmbedder(), question, 3)
        assert rows[0]["clinical_topic_slug"] == slug, (question, [r["clinical_topic_slug"] for r in rows])


@pytest.fixture
def client(database):
    from dental_ai.api import app, get_assistant

    get_assistant.cache_clear()
    return TestClient(app)


def test_admin_page_and_endpoints(client):
    assert "Quản trị Nha Khoa AI" in client.get("/admin").text
    stats = client.get("/api/admin/stats", headers=ADMIN).json()
    assert "questions" in stats and "pending_reviews" in stats

    doc = json.loads((ROOT / "data" / "examples" / "mau_sau_rang_fluoride_ADA2018.json").read_text(encoding="utf-8"))
    doc["protocol_core"]["clinical_topic_slug"] = "admin-test-slug"
    rid = client.post("/api/admin/submit?submitted_by=bs", json=doc, headers=ADMIN).json()["review_id"]
    detail = client.get(f"/api/admin/reviews/{rid}", headers=ADMIN).json()
    assert detail["status"] == "PENDING" and detail["payload"]["protocol_core"]["clinical_topic_slug"] == "admin-test-slug"
    r = client.post(f"/api/admin/reviews/{rid}", json={"approve": False, "reviewer": "BS A", "note": "thiếu nguồn"}, headers=ADMIN)
    assert r.json()["status"] == "REJECTED"
    assert client.post(f"/api/admin/reviews/{rid}", json={"approve": True, "reviewer": "BS A"}, headers=ADMIN).status_code == 409

    log_id = client.post("/api/ask", json={"question": "Niềng răng có đau không?"}).json()["log_id"]
    log = client.get(f"/api/admin/logs/{log_id}", headers=ADMIN).json()
    assert log["question"] == "Niềng răng có đau không?" and log["protocol_titles"]


def test_extract_requires_api_key(client):
    r = client.post("/api/admin/extract", files={"file": ("a.pdf", b"%PDF-1.4", "application/pdf")}, headers=ADMIN)
    assert r.status_code == 503
