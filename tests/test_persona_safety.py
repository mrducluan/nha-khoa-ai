import pytest

from dental_ai.persona import DOCTOR, PATIENT, detect_persona
from dental_ai.query_expansion import expand_query
from dental_ai.safety import detect_red_flags


@pytest.mark.parametrize("question", [
    "Torque cài đặt MUA thẳng bao nhiêu Ncm?",
    "Chỉ định nâng xoang kín khi RBH 5mm theo ITI?",
    "So sánh EFP S3 và ADA về kháng sinh toàn thân trong SRP stage III",
    "Bệnh nhân nam 55 tuổi HbA1c 9% có cấy implant được không?",
])
def test_doctor_questions(question):
    assert detect_persona(question).mode == DOCTOR


@pytest.mark.parametrize("question", [
    "Tôi bị chảy máu chân răng khi đánh răng có sao không?",
    "Con tôi 7 tuổi răng mọc lệch, niềng răng có đau không?",
    "Trồng răng implant bao lâu thì ăn nhai được?",
    "Răng em bị ê buốt khi uống nước lạnh",
])
def test_patient_questions(question):
    assert detect_persona(question).mode == PATIENT


def test_explicit_role_overrides_detection():
    assert detect_persona("Torque MUA bao nhiêu Ncm?", "patient").mode == PATIENT
    assert detect_persona("Tôi bị đau răng", "doctor").mode == DOCTOR


@pytest.mark.parametrize("text,code", [
    ("Sau nhổ răng khôn tôi bị sưng má lan lên mắt và sốt cao", "SPREADING_INFECTION"),
    ("Tôi khó thở và sưng dưới lưỡi", "AIRWAY"),
    ("Nhổ răng xong chảy máu không cầm được", "BLEEDING"),
    ("Con tôi ngã bị bật cả răng cửa ra ngoài", "TRAUMA"),
    ("Tê môi dưới kéo dài 2 tuần sau cắm implant", "NERVE"),
    ("Vết loét trong má không lành hơn 2 tuần", "ORAL_CANCER"),
    ("Uống nước bị chảy lên mũi sau nâng xoang", "SINUS_IMPLANT"),
])
def test_red_flags_detected(text, code):
    assert code in {f.code for f in detect_red_flags(text)}


def test_no_red_flag_for_routine_question():
    assert detect_red_flags("Niềng răng trong suốt mất bao lâu?") == []


def test_query_expansion_maps_lay_terms():
    expanded = expand_query("Tôi hay bị chảy máu chân răng và hôi miệng")
    assert "periodontitis" in expanded
    assert expand_query("Câu hỏi không liên quan") == "Câu hỏi không liên quan"
