"""Quản lý kho tri thức: khởi tạo DB, sinh chỉ mục, nạp & phê duyệt tài liệu mới."""

from __future__ import annotations

import json
import logging
from typing import Any

import psycopg
from pgvector.psycopg import register_vector
from psycopg.types.json import Jsonb

from .chunker import build_chunks
from .config import get_settings
from .db import get_setting, set_setting
from .embeddings import Embedder
from .validation import validate_document, validate_payload_parts

log = logging.getLogger(__name__)

TIER_WEIGHT = {
    "TIER_1_GOLD_STANDARD": 1.50,
    "TIER_2_INTERNATIONAL_GUIDE": 1.20,
    "TIER_3_PEER_REVIEWED": 1.00,
}
BASE_FILES = (
    "01_schema_golden_hybrid_dental_rag.sql",
    "05_seed_core_dental_knowledge.sql",
    "06_seed_advanced_implant_prostho_sinus.sql",
)
UPGRADE_FILES = ("07_search_v2_and_app_tables.sql", "08_more_source_organizations.sql")


# ----------------------------------------------------------------------------
# Khởi tạo cơ sở dữ liệu
# ----------------------------------------------------------------------------
def init_db(conn: psycopg.Connection, reset: bool = False) -> list[str]:
    """Chạy các file SQL theo thứ tự. File 01/05/06 chỉ chạy khi DB còn trống."""
    sql_dir = get_settings().sql_dir
    if reset:
        conn.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    exists = conn.execute("SELECT to_regclass('public.dental_sources') IS NOT NULL AS ok").fetchone()["ok"]
    files = list(UPGRADE_FILES) if exists else [*BASE_FILES, *UPGRADE_FILES]
    for name in files:
        conn.execute((sql_dir / name).read_text(encoding="utf-8"))
    conn.commit()
    register_vector(conn)
    return files


# ----------------------------------------------------------------------------
# Sinh chỉ mục (chunks + embeddings)
# ----------------------------------------------------------------------------
def _source_label(row: dict[str, Any]) -> str:
    return f"{row['organization_code']} {row['publication_year']} ({row['evidence_level']})"


def _insert_generated_chunks(conn: psycopg.Connection, embedder: Embedder, protocol: dict[str, Any]) -> int:
    chunks = build_chunks(
        protocol_title=protocol["protocol_title"],
        primary_specialty=protocol["primary_specialty"],
        secondary_specialties=protocol["secondary_specialties"],
        source_label=_source_label(protocol),
        pico=protocol["pico_structured"],
        payload=protocol["clinical_payload"],
    )
    vectors = embedder.embed([c.text for c in chunks])
    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO child_knowledge_chunks
                 (protocol_id, source_id, specialty, authority_tier, chunk_section_type,
                  contextualized_text, embedding, is_generated)
               VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)""",
            [
                (protocol["protocol_id"], protocol["source_id"], protocol["primary_specialty"],
                 protocol["authority_tier"], c.section, c.text, v)
                for c, v in zip(chunks, vectors)
            ],
        )
    return len(chunks)


_PROTOCOL_SQL = """
    SELECT p.protocol_id, p.source_id, p.primary_specialty::text AS primary_specialty,
           p.secondary_specialties::text[] AS secondary_specialties, p.protocol_title,
           p.pico_structured, p.clinical_payload, s.organization_code,
           s.authority_tier::text AS authority_tier, s.publication_year,
           s.evidence_level::text AS evidence_level
    FROM parent_clinical_protocols p JOIN dental_sources s USING (source_id)
"""


def reindex(conn: psycopg.Connection, embedder: Embedder) -> dict[str, int]:
    """Sinh lại toàn bộ chunk tự động và tính lại embedding cho mọi chunk.

    - Chunk do hệ thống sinh (is_generated) bị xoá và sinh lại từ clinical_payload.
    - Chunk viết tay (VD: trong file 06) được giữ nguyên nội dung, chỉ tính lại embedding
      (embedding mẫu array_fill(0.012) trong seed không mang ngữ nghĩa).
    """
    register_vector(conn)
    conn.execute("DELETE FROM child_knowledge_chunks WHERE is_generated")
    generated = 0
    for protocol in conn.execute(_PROTOCOL_SQL).fetchall():
        generated += _insert_generated_chunks(conn, embedder, protocol)

    manual = conn.execute(
        "SELECT chunk_id, contextualized_text FROM child_knowledge_chunks WHERE NOT is_generated"
    ).fetchall()
    if manual:
        vectors = embedder.embed([m["contextualized_text"] for m in manual])
        with conn.cursor() as cur:
            cur.executemany(
                "UPDATE child_knowledge_chunks SET embedding = %s WHERE chunk_id = %s",
                [(v, m["chunk_id"]) for m, v in zip(manual, vectors)],
            )
    set_setting(conn, "embedding_provider", embedder.name)
    conn.commit()
    return {"generated_chunks": generated, "reembedded_manual_chunks": len(manual)}


def check_embedding_provider(conn: psycopg.Connection, embedder: Embedder) -> str | None:
    """Cảnh báo nếu chỉ mục được tạo bằng nhà cung cấp embedding khác."""
    indexed = get_setting(conn, "embedding_provider")
    if indexed is None:
        return "Chưa chạy reindex — embedding trong DB chỉ là giá trị mẫu. Chạy: python -m dental_ai reindex"
    if indexed != embedder.name:
        return f"Chỉ mục tạo bằng '{indexed}' nhưng đang dùng '{embedder.name}'. Chạy lại: python -m dental_ai reindex"
    return None


# ----------------------------------------------------------------------------
# Nạp tài liệu mới theo schema 02
# ----------------------------------------------------------------------------
def render_markdown(doc: dict[str, Any]) -> str:
    meta, core = doc["source_metadata"], doc["protocol_core"]
    pico, pay = doc["pico_evidence_matrix"], doc["clinical_execution_payload"]
    lines = [
        f"# {core['protocol_title']}",
        f"*Nguồn: {meta['organization_code']} — {meta['document_title']} ({meta['publication_year']}) — {meta['doi_or_pmid']}*",
        "## PICO",
        *(f"- **{k.split('_')[0]}**: {v}" for k, v in pico.items()),
        "## Cơ chế", pay["pathophysiology_mechanism"],
        "## Chỉ định", *(f"- {i}" for i in pay["indications"]),
        "## Chống chỉ định tuyệt đối", *(f"- {i}" for i in pay["contraindications_absolute"]),
        "## Chống chỉ định tương đối", *(f"- {i}" for i in pay["contraindications_relative"]),
        "## Quy trình",
        *(f"{s['step']}. **{s['phase_name']}** — {s['clinical_action']} _(Thông số: {s['technical_parameters']})_"
          for s in pay["step_by_step_procedure"]),
    ]
    return "\n\n".join(lines)


def ingest_document(conn: psycopg.Connection, embedder: Embedder, doc: dict[str, Any]) -> str:
    """Nạp trực tiếp một tài liệu đã được duyệt. Trả về protocol_id."""
    errors = validate_document(doc)
    if errors:
        raise ValueError("Tài liệu không hợp lệ theo schema 02:\n- " + "\n- ".join(errors))
    register_vector(conn)
    meta, core = doc["source_metadata"], doc["protocol_core"]
    tier = meta["authority_tier"]

    row = conn.execute("SELECT source_id FROM dental_sources WHERE doi_or_pmid = %s", (meta["doi_or_pmid"],)).fetchone()
    if row:
        source_id = row["source_id"]
    else:
        source_id = conn.execute(
            """INSERT INTO dental_sources (organization_code, authority_tier, document_title, authors_or_committee,
                   publication_year, journal_or_series, doi_or_pmid, evidence_level, grade_of_recommendation,
                   authority_weight)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING source_id""",
            (meta["organization_code"], tier, meta["document_title"], meta.get("authors_or_committee") or "N/A",
             meta["publication_year"], meta.get("journal_or_series"), meta["doi_or_pmid"], meta["evidence_level"],
             meta.get("grade_of_recommendation"), TIER_WEIGHT[tier]),
        ).fetchone()["source_id"]

    protocol_id = conn.execute(
        """INSERT INTO parent_clinical_protocols (source_id, primary_specialty, secondary_specialties,
               protocol_title, clinical_topic_slug, pico_structured, clinical_payload, full_markdown_content)
           VALUES (%s, %s, %s::dental_specialty_enum[], %s, %s, %s, %s, %s) RETURNING protocol_id""",
        (source_id, core["primary_specialty"], core.get("secondary_specialties", []), core["protocol_title"],
         core["clinical_topic_slug"], Jsonb(doc["pico_evidence_matrix"]), Jsonb(doc["clinical_execution_payload"]),
         render_markdown(doc)),
    ).fetchone()["protocol_id"]

    manual = doc.get("contextualized_child_chunks") or []
    if manual:
        vectors = embedder.embed([c["contextualized_text"] for c in manual])
        with conn.cursor() as cur:
            cur.executemany(
                """INSERT INTO child_knowledge_chunks (protocol_id, source_id, specialty, authority_tier,
                       chunk_section_type, contextualized_text, embedding)
                   VALUES (%s,%s,%s,%s,%s,%s,%s)""",
                [(protocol_id, source_id, core["primary_specialty"], tier, c["chunk_section_type"],
                  c["contextualized_text"], v) for c, v in zip(manual, vectors)],
            )
    protocol = conn.execute(_PROTOCOL_SQL + " WHERE p.protocol_id = %s", (protocol_id,)).fetchone()
    _insert_generated_chunks(conn, embedder, protocol)
    return str(protocol_id)


def submit_for_review(conn: psycopg.Connection, doc: dict[str, Any], submitted_by: str = "unknown") -> str:
    errors = validate_document(doc)
    if errors:
        raise ValueError("Tài liệu không hợp lệ theo schema 02:\n- " + "\n- ".join(errors))
    return str(conn.execute(
        "INSERT INTO knowledge_review_queue (submitted_by, payload) VALUES (%s, %s) RETURNING review_id",
        (submitted_by, Jsonb(doc)),
    ).fetchone()["review_id"])


def review(conn: psycopg.Connection, embedder: Embedder, review_id: str, approve: bool,
           reviewer: str, note: str | None = None) -> str | None:
    row = conn.execute(
        "SELECT payload, status FROM knowledge_review_queue WHERE review_id = %s FOR UPDATE", (review_id,)
    ).fetchone()
    if not row:
        raise LookupError(f"Không tìm thấy review_id {review_id}")
    if row["status"] != "PENDING":
        raise ValueError(f"Tài liệu đã được xử lý ({row['status']})")
    protocol_id = ingest_document(conn, embedder, row["payload"]) if approve else None
    conn.execute(
        """UPDATE knowledge_review_queue SET status = %s, reviewer = %s, review_note = %s,
               reviewed_at = NOW(), created_protocol_id = %s WHERE review_id = %s""",
        ("APPROVED" if approve else "REJECTED", reviewer, note, protocol_id, review_id),
    )
    return protocol_id


def audit(conn: psycopg.Connection) -> list[dict[str, Any]]:
    """Kiểm định toàn bộ phác đồ trong DB theo schema 02 + liệt kê trích dẫn cần xác minh."""
    report = []
    rows = conn.execute(
        """SELECT p.protocol_id, p.protocol_title, p.pico_structured, p.clinical_payload, s.organization_code,
                  s.publication_year, s.doi_or_pmid,
                  (SELECT count(*) FROM child_knowledge_chunks c WHERE c.protocol_id = p.protocol_id) AS chunks
           FROM parent_clinical_protocols p JOIN dental_sources s USING (source_id) ORDER BY p.protocol_title"""
    ).fetchall()
    for r in rows:
        report.append({
            "protocol_title": r["protocol_title"],
            "source": f"{r['organization_code']} {r['publication_year']} {r['doi_or_pmid']}",
            "chunks": r["chunks"],
            "schema_errors": validate_payload_parts(r["pico_structured"], r["clinical_payload"]),
        })
    return report


def load_json(path: str) -> dict[str, Any]:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)
