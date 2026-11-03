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


@pytest.mark.parametrize("q,code", [
    ("Mất răng hàm lâu năm không trồng lại có sao không", "TOOTH_LOSS_DRIFT"),
    ("răng đối diện bị trồi xuống chỗ mất răng", "TOOTH_LOSS_DRIFT"),
    ("Răng sứ kim loại bị viền đen cổ răng", "CROWN"),
    ("Nên làm sứ không kim loại hay sứ có sườn kim loại", "CROWN"),
    ("Răng chữa tủy rồi có cần bọc mão không", "POST_ENDO"),
    ("Mão che phủ múi cho răng sau đã nội nha", "POST_ENDO"),
    ("Dáng răng có nên chọn theo khuôn mặt không", "SMILE_DESIGN"),
    ("Ngưỡng ΔE00 chấp nhận được khi so màu", "SMILE_DESIGN"),
    ("Trụ implant bị sưng chảy máu", "PERI_IMPLANT"),
    ("Thay khớp háng có cần kháng sinh dự phòng", "ANTIBIOTIC_PROPHYLAXIS"),
    ("Làm cầu răng sứ có phải mài răng bên cạnh", "BRIDGE"),
    ("Mất 1 răng hàm, làm cầu 3 răng hay cắm implant", "BRIDGE"),
    ("Răng hít gió lạnh vào là buốt lên tận óc", "SENSITIVITY"),
    ("Mỗi lần ăn cay lại nổi mấy nốt loét trắng trong má", "APHTHOUS"),
    ("Sáng dậy đau mang tai lan lên thái dương khi nhai", "TMJ"),
    ("Mẹ tôi tiêm Prolia có nhổ răng được không", "MRONJ"),
    ("Mảng trắng ở bờ lưỡi lau không đi", "ORAL_LESION"),
])
def test_new_intents(q, code):
    assert code in codes(q)


def test_new_intents_no_false_matches():
    assert "CROWN" not in codes("Tiêu mào xương quanh implant")            # "mào" ≠ "mão"
    assert "CROWN" not in codes("Độ dày mài men cho laminate veneer lithium disilicate")  # vật liệu dùng chung
    assert "IMPLANT" not in codes("tẩy trắng bên trong cho răng chết tuỷ")
    assert "TOOTH_LOSS_DRIFT" not in codes("Răng khôn mọc nghiêng có nên nhổ")
    assert "FULL_ARCH" in codes("All-on-4 hay All-on-6 cho hàm trên")     # có gạch nối
    assert "CROWN" not in codes("Cầu răng sứ 3 đơn vị")                     # cầu răng ≠ bọc răng sứ
    assert "IMPLANT" not in codes("Mài răng trụ làm cầu")                   # "răng trụ" ≠ "trụ implant"
    assert "APHTHOUS" not in codes("Bị nấm miệng trắng lưỡi")               # nấm miệng ≠ nhiệt miệng


@pytest.mark.parametrize("q", ["Mất răng hàm lâu năm không trồng lại có sao không",
                               "mat rang 3 nam roi rang ben canh xo lech het"])
def test_tooth_loss_is_not_trauma_emergency(q):
    from dental_ai.safety import detect_red_flags
    assert not detect_red_flags(q)


@pytest.mark.parametrize("q", ["Kali nitrat hay arginine cho nhạy cảm ngà cổ răng",   # "ngà" ≠ "ngã"
                               "răng kế bên chỗ nhổ bị ngả vào trong",                # "ngả" ≠ "ngã"
                               "e buot nga rang"])
def test_dentin_and_tilting_are_not_trauma(q):
    from dental_ai.safety import detect_red_flags
    assert not detect_red_flags(q)


@pytest.mark.parametrize("q", ["Con tôi bị ngã rơi mất răng cửa", "Té xe gãy mất chiếc răng",
                               "Bé bị ngã va vào răng cửa", "be bi nga va vao rang cua"])
def test_trauma_still_detected(q):
    from dental_ai.safety import detect_red_flags
    assert "TRAUMA" in {f.code for f in detect_red_flags(q)}


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


@pytest.mark.parametrize("dataset,min_scale", [("questions.jsonl", 1.0), ("holdout_questions.jsonl", 0.95),
                                               ("holdout_v2_questions.jsonl", 0.95), ("holdout_v3_questions.jsonl", 0.95)])
def test_quality_thresholds(knowledge_with_drafts, dataset, min_scale):
    from dental_ai.db import connect
    from dental_ai.embeddings import LocalHashEmbedder
    from dental_ai.evaluation import evaluate, format_report, load_dataset

    with connect(knowledge_with_drafts) as conn:
        report = evaluate(conn, LocalHashEmbedder(), load_dataset(ROOT / "evals" / dataset))
    low = {k: str(report.metrics[k]) for k, t in THRESHOLDS.items()
           if k in report.metrics and report.rate(k) < t * min_scale}
    assert not low, f"Chất lượng dưới ngưỡng trên {dataset}: {low}\n" + format_report(report, True)
