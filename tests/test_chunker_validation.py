import json
from pathlib import Path

from dental_ai.chunker import build_chunks
from dental_ai.validation import validate_document

ROOT = Path(__file__).resolve().parent.parent
SAMPLE = ROOT / "data" / "examples" / "mau_sau_rang_fluoride_ADA2018.json"


def test_sample_document_is_valid():
    doc = json.loads(SAMPLE.read_text(encoding="utf-8"))
    assert validate_document(doc) == []


def test_invalid_document_reports_errors():
    doc = json.loads(SAMPLE.read_text(encoding="utf-8"))
    doc["source_metadata"]["organization_code"] = "UNKNOWN_ORG"
    del doc["pico_evidence_matrix"]
    errors = validate_document(doc)
    assert any("organization_code" in e for e in errors)
    assert any("pico_evidence_matrix" in e for e in errors)


def test_generated_chunks_follow_schema_header_pattern():
    doc = json.loads(SAMPLE.read_text(encoding="utf-8"))
    chunks = build_chunks(
        protocol_title=doc["protocol_core"]["protocol_title"],
        primary_specialty="GENERAL_OMFS_ENDODONTICS",
        secondary_specialties=[],
        source_label="ADA 2018",
        pico=doc["pico_evidence_matrix"],
        payload=doc["clinical_execution_payload"],
    )
    sections = {c.section for c in chunks}
    assert sections == {"INDICATION_CONTRA", "PROCEDURE_PARAMS", "PICO_OUTCOME", "COMPLICATION", "PATIENT_FAQ"}
    # Mỗi chunk phải hợp lệ theo pattern contextualized_text của schema 02
    for c in chunks:
        wrapped = {**doc, "contextualized_child_chunks": [{"chunk_section_type": c.section, "contextualized_text": c.text}]}
        assert validate_document(wrapped) == [], c.text[:120]
        assert len(c.text) < 3000
