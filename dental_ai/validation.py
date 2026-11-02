"""Kiểm định dữ liệu tri thức theo schema 02 (DentalAcademicPDFIngestionSchema)."""

from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from jsonschema import Draft7Validator

from .config import get_settings


@lru_cache
def ingestion_validator() -> Draft7Validator:
    schema = json.loads(get_settings().ingestion_schema_path.read_text(encoding="utf-8"))
    return Draft7Validator(schema)


def validate_document(doc: dict[str, Any]) -> list[str]:
    """Trả về danh sách lỗi (rỗng = hợp lệ)."""
    errors = []
    for err in sorted(ingestion_validator().iter_errors(doc), key=lambda e: list(e.path)):
        where = "/".join(str(p) for p in err.path) or "(gốc)"
        errors.append(f"{where}: {err.message[:300]}")
    return errors


def validate_payload_parts(pico: dict[str, Any], payload: dict[str, Any]) -> list[str]:
    """Kiểm tra pico_structured + clinical_payload của một phác đồ đã có trong DB."""
    schema = ingestion_validator().schema["properties"]
    errors = []
    for name, value in (("pico_evidence_matrix", pico), ("clinical_execution_payload", payload)):
        for err in Draft7Validator(schema[name]).iter_errors(value):
            where = "/".join(str(p) for p in err.path) or "(gốc)"
            errors.append(f"{name}/{where}: {err.message[:300]}")
    return errors
