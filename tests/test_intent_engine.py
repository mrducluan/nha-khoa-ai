"""Bộ máy nhận diện: chuẩn hoá, chủ đề, phạm vi, đối tượng đặc biệt + ngưỡng chất lượng trên bộ đánh giá."""

from pathlib import Path

import pytest

from dental_ai.intents import detect_intents, protocol_intents
from dental_ai.scope import detect_caution, is_dental_question
from dental_ai.textnorm import normalize

ROOT = Path(__file__).resolve().parent.parent


@pytest.mark.parametrize("raw,expected", [
    ("bs ơi chảy máu lợi hoài ko hết, bn tiền", "bac si oi chay mau nuou hoai khong het, bao nhieu tien"),
    ("BN nam 52t HbA1c 8%", "benh nhan nam 52 tuoi hba1c 8%"),
    ("implant dùng được bn năm", "implant dung duoc bao nhieu nam"),
    ("trong rang inplant dc ko", "trong rang implant duoc khong"),
    ("rang cam bi sau", "rang ham bi sau"),
    ("lỗi code python", "loi code python"),          # "lỗi" KHÔNG bị đổi thành "nướu"
])
def test_normalize(raw, expected):
    assert normalize(raw) == expected


def codes(text):
    return {i.code for i in detect_intents(text)}


def test_word_boundaries_prevent_false_matches():
    assert "THIRD_MOLAR" not in codes("Tẩy trắng răng có hại men răng không")   # "răng không" ≠ "răng khôn"
    assert "PULP_PAIN" not in codes("Viết code Python sắp xếp danh sách")       # "sắp xếp" ≠ "áp xe"
    assert "FULL_ARCH" not in codes("Tư vấn mua điện thoại")                    # "mua" ≠ "MUA"
    assert "FULL_ARCH" in codes("Torque MUA bao nhiêu Ncm")
    assert "THIRD_MOLAR" not in codes("SDF 38% cho sâu răng sữa")               # "38%" ≠ răng 38


def test_protocol_topics_come_from_title():
    assert protocol_intents({"protocol_title": "Phác đồ Mặt dán sứ Veneer",
                             "pico_structured": {"P_population_problem": "răng nhiễm màu tetracycline"}}) == {"VENEER"}


@pytest.mark.parametrize("q", ["Giá vàng hôm nay", "Viết code Python", "Cách nấu phở", "Đau lưng nên tập gì"])
def test_off_topic(q):
    assert not is_dental_question(q)


@pytest.mark.parametrize("q", ["rang toi bi e buot", "Torque MUA bao nhiêu Ncm", "hôi miệng quá", "SRP có cần kháng sinh"])
def test_dental(q):
    assert is_dental_question(q)


def test_cautions():
    assert {c.code for c in detect_caution("Bầu 3 tháng đầu nhổ răng khôn được không")} == {"PREGNANCY"}
    assert "ANTICOAGULANT" in {c.code for c in detect_caution("ông tôi uống aspirin hằng ngày")}
    assert detect_caution("Niềng răng có đau không") == []


# ---- Ngưỡng chất lượng trên bộ câu hỏi (chạy trong CI: tụt chất lượng → kiểm thử thất bại) ----
THRESHOLDS = {
    "persona": 0.95, "flags_recall": 0.95, "flags_precision": 0.98, "scope_dental": 0.98, "scope_off_topic": 0.95,
    "caution": 0.95, "topic_top1": 0.95, "topic_top3": 0.98, "none_detected": 0.90, "db_confident": 0.90,
}


@pytest.fixture(scope="module")
def knowledge_with_drafts(database):
    """CSDL kiểm thử + toàn bộ bản nháp đã duyệt (mô phỏng sau khi bác sĩ duyệt)."""
    import glob

    from dental_ai.db import connect
    from dental_ai.embeddings import LocalHashEmbedder
    from dental_ai.knowledge import load_json, review, submit_for_review

    paths = [str(ROOT / "data/examples/mau_sau_rang_fluoride_ADA2018.json"),
             *sorted(glob.glob(str(ROOT / "data/knowledge_drafts/*.json")))]
    with connect(database) as conn:
        have = {r["clinical_topic_slug"] for r in conn.execute("SELECT clinical_topic_slug FROM parent_clinical_protocols")}
        for p in paths:
            doc = load_json(p)
            if doc["protocol_core"]["clinical_topic_slug"] not in have:
                review(conn, LocalHashEmbedder(), submit_for_review(conn, doc, "ci"), True, "ci")
    return database


@pytest.mark.parametrize("dataset,min_scale", [("questions.jsonl", 1.0), ("holdout_questions.jsonl", 0.95)])
def test_quality_thresholds(knowledge_with_drafts, dataset, min_scale):
    from dental_ai.db import connect
    from dental_ai.embeddings import LocalHashEmbedder
    from dental_ai.evaluation import evaluate, format_report, load_dataset

    with connect(knowledge_with_drafts) as conn:
        report = evaluate(conn, LocalHashEmbedder(), load_dataset(ROOT / "evals" / dataset))
    low = {k: str(report.metrics[k]) for k, t in THRESHOLDS.items()
           if k in report.metrics and report.rate(k) < t * min_scale}
    assert not low, f"Chất lượng dưới ngưỡng trên {dataset}: {low}\n" + format_report(report, True)
