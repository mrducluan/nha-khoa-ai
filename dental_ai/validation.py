"""Kiểm định dữ liệu tri thức theo schema 02 (DentalAcademicPDFIngestionSchema)."""

from __future__ import annotations

import json
import re
from functools import lru_cache
from typing import Any

from jsonschema import Draft7Validator

from .config import get_settings


@lru_cache
def ingestion_validator() -> Draft7Validator:
    schema = json.loads(get_settings().ingestion_schema_path.read_text(encoding="utf-8"))
    return Draft7Validator(schema)


# Giới hạn độ dài cột trong db/01 — schema 02 không ràng buộc nên phải kiểm tra thêm
DB_LIMITS = [
    (("source_metadata", "grade_of_recommendation"), 20),
    (("source_metadata", "doi_or_pmid"), 120),
    (("protocol_core", "clinical_topic_slug"), 150),
]


def validate_document(doc: dict[str, Any]) -> list[str]:
    """Trả về danh sách lỗi (rỗng = hợp lệ)."""
    errors = []
    for err in sorted(ingestion_validator().iter_errors(doc), key=lambda e: list(e.path)):
        where = "/".join(str(p) for p in err.path) or "(gốc)"
        errors.append(f"{where}: {err.message[:300]}")
    for (section, key), limit in DB_LIMITS:
        value = (doc.get(section) or {}).get(key)
        if isinstance(value, str) and len(value) > limit:
            errors.append(f"{section}/{key}: dài {len(value)} ký tự, CSDL chỉ cho phép tối đa {limit}")
    slug = (doc.get("protocol_core") or {}).get("clinical_topic_slug")
    if isinstance(slug, str) and not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug):
        errors.append("protocol_core/clinical_topic_slug: chỉ dùng chữ thường không dấu, số và dấu gạch ngang")
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
