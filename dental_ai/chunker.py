"""Sinh child chunks từ phác đồ cha theo đúng chuẩn header của schema 02.

Mỗi chunk bắt đầu bằng:
  [CHUYÊN KHOA: ... | NGUỒN: ... | CHỐNG CHỈ ĐỊNH CỐT LÕI: ...] <nội dung>
để embedding luôn mang ngữ cảnh an toàn lâm sàng (Contextual Retrieval).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

MAX_CHARS = 2400


@dataclass
class Chunk:
    section: str
    text: str


def _join(items: list[str] | None, sep: str = "; ") -> str:
    return sep.join(i.strip() for i in (items or []) if i and i.strip())


def _short(text: str, limit: int) -> str:
    text = " ".join(text.split())
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def build_header(specialties: str, source_label: str, payload: dict[str, Any]) -> str:
    contra = _join(payload.get("contraindications_absolute")) or "Không ghi nhận"
    return f"[CHUYÊN KHOA: {specialties} | NGUỒN: {source_label} | CHỐNG CHỈ ĐỊNH CỐT LÕI: {_short(contra, 220)}]"


def _split(body: str) -> list[str]:
    """Cắt nội dung dài theo câu/đoạn để mỗi chunk < MAX_CHARS."""
    if len(body) <= MAX_CHARS:
        return [body]
    parts, current = [], ""
    for piece in body.replace("\n", " \n").split(" | "):
        candidate = f"{current} | {piece}" if current else piece
        if len(candidate) > MAX_CHARS and current:
            parts.append(current)
            current = piece
        else:
            current = candidate
    if current:
        parts.append(current)
    return [p[:MAX_CHARS] for p in parts]


def build_chunks(
    *,
    protocol_title: str,
    primary_specialty: str,
    secondary_specialties: list[str] | None,
    source_label: str,
    pico: dict[str, Any],
    payload: dict[str, Any],
) -> list[Chunk]:
    specs = " & ".join([primary_specialty, *(secondary_specialties or [])])
    header = build_header(specs, source_label, payload)
    chunks: list[Chunk] = []

    def add(section: str, body: str) -> None:
        body = " ".join(body.split())
        if body:
            for part in _split(body):
                chunks.append(Chunk(section, f"{header} {protocol_title}: {part}"))

    add(
        "INDICATION_CONTRA",
        f"Chỉ định: {_join(payload.get('indications'))}. "
        f"Chống chỉ định tuyệt đối: {_join(payload.get('contraindications_absolute'))}. "
        f"Chống chỉ định tương đối: {_join(payload.get('contraindications_relative'))}.",
    )

    steps = payload.get("step_by_step_procedure") or []
    add(
        "PROCEDURE_PARAMS",
        " | ".join(
            f"Bước {s.get('step')}: {s.get('phase_name', '')} — {s.get('clinical_action', '')} "
            f"Thông số: {s.get('technical_parameters', '')}"
            for s in steps
        ),
    )

    add(
        "PICO_OUTCOME",
        f"P (Đối tượng): {pico.get('P_population_problem', '')} I (Can thiệp): {pico.get('I_intervention', '')} "
        f"C (So sánh): {pico.get('C_comparison', '')} O (Kết cục): {pico.get('O_outcome_metrics', '')} "
        f"Cơ chế: {payload.get('pathophysiology_mechanism', '')}",
    )

    comps = payload.get("complications_and_management") or []
    pearls = payload.get("educational_pearls_for_residents") or {}
    add(
        "COMPLICATION",
        " | ".join(
            f"Biến chứng: {c.get('complication', '')} Phòng ngừa: {c.get('prevention', '')} "
            f"Xử trí: {c.get('management_protocol', '')}"
            for c in comps
        )
        + f" | Bẫy lâm sàng: {_join(pearls.get('common_pitfalls'))} | Mẹo quyết định: {_join(pearls.get('clinical_decision_tips'))}",
    )

    pt = payload.get("patient_friendly_translation") or {}
    add(
        "PATIENT_FAQ",
        f"Đây là gì: {pt.get('what_is_it', '')} Vì sao cần: {pt.get('why_needed', '')} "
        f"Điều gì sẽ diễn ra: {pt.get('what_to_expect', '')} Chăm sóc tại nhà: {_join(pt.get('home_care_instructions'))}",
    )
    return chunks
