"""DNA thương hiệu Tâm Đức Smile được nối vào system prompt (và có thể tắt)."""

from dental_ai.config import Settings
from dental_ai.llm import load_brand_dna, load_system_prompt


def test_dna_file_is_valid_and_complete():
    dna = load_brand_dna(Settings(_env_file=None))
    assert dna is not None
    assert "Răng tốt – Sức khỏe tốt" in dna
    assert "1900 8040" in dna
    assert "## 13. DNA KỊCH BẢN IMPLANT" in dna  # file không bị cắt cụt


def test_system_prompt_includes_dna_with_guardrails():
    prompt = load_system_prompt(Settings(_env_file=None))
    assert "## 4. QUY TẮC VẬN HÀNH HỆ THỐNG" in prompt
    assert "<dna_thuong_hieu>" in prompt and "</dna_thuong_hieu>" in prompt
    assert prompt.index("## 4. QUY TẮC VẬN HÀNH") < prompt.index("<dna_thuong_hieu>")
    assert "[CẦN XÁC NHẬN]" in prompt


def test_dna_can_be_disabled():
    prompt = load_system_prompt(Settings(_env_file=None, brand_dna_enabled=False))
    assert "<dna_thuong_hieu>" not in prompt


def test_missing_dna_file_is_skipped(tmp_path):
    s = Settings(_env_file=None, brand_dna_file=str(tmp_path / "khong_co.md"))
    assert load_brand_dna(s) is None
    assert "<dna_thuong_hieu>" not in load_system_prompt(s)
