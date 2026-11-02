"""Chế độ C — đội nội dung viết kịch bản video ngắn."""

import pytest

from dental_ai.config import Settings
from dental_ai.content_compliance import BANNED, NEEDS_CONFIRMATION, render_compliance_report, scan_claims
from dental_ai.llm import load_system_prompt
from dental_ai.persona import CONTENT, PATIENT, detect_persona


@pytest.mark.parametrize("question", [
    "Viết kịch bản TikTok 30 giây về trồng răng Implant cho bố mẹ",
    "Cho anh 5 hook Reels về niềng răng khay trong",
    "Viết caption và hashtag cho video YouTube Shorts tẩy trắng răng",
])
def test_content_requests_are_detected(question):
    assert detect_persona(question).mode == CONTENT


def test_patient_question_is_not_content():
    assert detect_persona("Trồng răng implant bao lâu thì ăn nhai được?").mode == PATIENT


def test_explicit_content_role():
    assert detect_persona("Implant cho người lớn tuổi", "content").mode == CONTENT


def test_system_prompt_has_content_mode():
    prompt = load_system_prompt(Settings(_env_file=None))
    assert "## 6. CHẾ ĐỘ C: CONTENT STUDIO" in prompt
    # Chế độ C vẫn có khi tắt DNA (kịch bản trung tính)
    assert "CHẾ ĐỘ C" in load_system_prompt(Settings(_env_file=None, brand_dna_enabled=False))


def codes(text):
    return {f.code: f for f in scan_claims(text)}


def test_scan_flags_banned_claims_with_original_text():
    found = codes("Cấy Implant 100% không đau, răng dùng vĩnh viễn — nha khoa số 1, giá rẻ nhất!")
    assert {"NO_PAIN", "ABSOLUTE", "SUPERLATIVE"} <= found.keys()
    assert all(found[c].level == BANNED for c in ("NO_PAIN", "ABSOLUTE", "SUPERLATIVE"))
    assert any("vĩnh viễn" in m for m in found["ABSOLUTE"].matches)  # trích lại đoạn gốc có dấu


def test_scan_flags_commercial_data_for_confirmation():
    found = codes("Implant chỉ 7.999.000đ/trụ, trả góp 0%, ưu đãi tuần này. Hơn 20 năm kinh nghiệm, 34 chi nhánh.")
    assert {"PRICE", "PROMO", "CREDENTIAL"} <= found.keys()
    assert all(found[c].level == NEEDS_CONFIRMATION for c in ("PRICE", "PROMO", "CREDENTIAL"))
    assert "7.999.000đ/trụ" in found["PRICE"].matches


def test_clean_script_passes():
    text = ("Mất một răng lâu năm có sao không? Bác sĩ sẽ khám, chụp phim rồi mới tư vấn phương án phù hợp. "
            "Hotline 1900 8040. Răng tốt – Sức khỏe tốt.")
    assert scan_claims(text) == []
    assert "✅" in render_compliance_report([])


def test_report_lists_flags():
    report = render_compliance_report(scan_claims("Cam kết kết quả đẹp"))
    assert "⛔" in report and "Cam kết kết quả" in report
