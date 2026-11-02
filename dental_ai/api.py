"""Web API + giao diện chat.

Chạy:  python -m dental_ai serve      (mặc định http://localhost:8000)
Tài liệu API tự động: http://localhost:8000/docs
"""

from __future__ import annotations

import json
import logging
import secrets
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import __version__
from .assistant import Assistant, search, source_summary
from .config import get_settings
from .db import connect, get_setting
from .knowledge import audit, review, submit_for_review

log = logging.getLogger(__name__)
STATIC_DIR = Path(__file__).parent / "static"

app = FastAPI(
    title="Nha Khoa AI",
    version=__version__,
    description="Hỏi đáp & tư vấn nha khoa thực chứng (ADA / ITI / FDI / CGDent / EFP / Cochrane).",
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@lru_cache
def get_assistant() -> Assistant:
    return Assistant()


# ----------------------------------------------------------------------------
# Mô hình dữ liệu
# ----------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=20000)


class AskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=4000)
    role: Literal["auto", "doctor", "patient"] = "auto"
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    specialty: Literal["IMPLANTOLOGY", "PERIODONTOLOGY", "ORTHODONTICS",
                       "ESTHETIC_PROSTHODONTICS", "GENERAL_OMFS_ENDODONTICS"] | None = None


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=2000)
    top_k: int = Field(default=5, ge=1, le=20)


class FeedbackRequest(BaseModel):
    log_id: str
    rating: Literal[-1, 1]
    note: str | None = Field(default=None, max_length=2000)


class ReviewDecision(BaseModel):
    approve: bool
    reviewer: str = Field(min_length=2, max_length=200)
    note: str | None = None


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    expected = get_settings().admin_token
    if not expected:
        raise HTTPException(503, "Chưa cấu hình ADMIN_TOKEN trong .env")
    if not x_admin_token or not secrets.compare_digest(x_admin_token, expected):
        raise HTTPException(401, "Sai hoặc thiếu X-Admin-Token")


# ----------------------------------------------------------------------------
# Công khai
# ----------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/health")
def health() -> dict[str, Any]:
    s = get_settings()
    try:
        with connect() as conn:
            counts = conn.execute(
                """SELECT (SELECT count(*) FROM dental_sources) AS sources,
                          (SELECT count(*) FROM parent_clinical_protocols) AS protocols,
                          (SELECT count(*) FROM child_knowledge_chunks) AS chunks,
                          (SELECT count(*) FROM knowledge_review_queue WHERE status = 'PENDING') AS pending_reviews"""
            ).fetchone()
            indexed_with = get_setting(conn, "embedding_provider")
        db_ok = True
    except Exception as exc:  # noqa: BLE001
        log.warning("Health check DB lỗi: %s", exc)
        counts, indexed_with, db_ok = {}, None, False
    assistant = get_assistant()
    return {
        "status": "ok" if db_ok else "degraded",
        "version": __version__,
        "database": db_ok,
        "knowledge": counts,
        "embedding": {"active": assistant.embedder.name, "indexed_with": indexed_with},
        "llm": {"configured": bool(s.anthropic_api_key), "model": s.claude_model if s.anthropic_api_key else None},
        "fallback_pubmed": s.fallback_enabled,
    }


@app.post("/api/ask")
def ask(req: AskRequest) -> dict[str, Any]:
    history = [m.model_dump() for m in req.history]
    return get_assistant().ask(req.question, req.role, history, req.specialty)


@app.post("/api/ask/stream")
def ask_stream(req: AskRequest) -> StreamingResponse:
    """Server-Sent Events: meta → delta… → done (hoặc error)."""
    history = [m.model_dump() for m in req.history]

    def events():
        try:
            for event in get_assistant().stream(req.question, req.role, history, req.specialty):
                yield f"data: {json.dumps(event, ensure_ascii=False, default=str)}\n\n"
        except Exception:  # noqa: BLE001
            log.exception("Lỗi xử lý câu hỏi")
            yield "data: " + json.dumps({"type": "error", "message": "Hệ thống gặp lỗi, vui lòng thử lại."},
                                         ensure_ascii=False) + "\n\n"

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.post("/api/search")
def api_search(req: SearchRequest) -> list[dict[str, Any]]:
    with connect() as conn:
        rows = search(conn, get_assistant().embedder, req.query, req.top_k)
    return [{**source_summary(r), "matched_chunks": r["matched_chunks"]} for r in rows]


@app.get("/api/protocols")
def list_protocols() -> list[dict[str, Any]]:
    with connect() as conn:
        return conn.execute(
            """SELECT p.protocol_id, p.protocol_title, p.primary_specialty, p.clinical_topic_slug,
                      s.organization_code, s.publication_year, s.evidence_level, s.doi_or_pmid
               FROM parent_clinical_protocols p JOIN dental_sources s USING (source_id)
               ORDER BY p.primary_specialty, p.protocol_title"""
        ).fetchall()


@app.get("/api/protocols/{protocol_id}")
def get_protocol(protocol_id: str) -> dict[str, Any]:
    with connect() as conn:
        row = conn.execute(
            """SELECT p.*, s.organization_code, s.document_title, s.authors_or_committee, s.publication_year,
                      s.journal_or_series, s.doi_or_pmid, s.evidence_level, s.grade_of_recommendation
               FROM parent_clinical_protocols p JOIN dental_sources s USING (source_id)
               WHERE p.protocol_id::text = %s""",
            (protocol_id,),
        ).fetchone()
    if not row:
        raise HTTPException(404, "Không tìm thấy phác đồ")
    return row


@app.post("/api/feedback")
def feedback(req: FeedbackRequest) -> dict[str, bool]:
    with connect() as conn:
        updated = conn.execute(
            "UPDATE qa_logs SET feedback_rating = %s, feedback_note = %s WHERE log_id::text = %s",
            (req.rating, req.note, req.log_id),
        ).rowcount
    if not updated:
        raise HTTPException(404, "Không tìm thấy log_id")
    return {"ok": True}


# ----------------------------------------------------------------------------
# Quản trị (cần header X-Admin-Token)
# ----------------------------------------------------------------------------
@app.post("/api/admin/submit", dependencies=[Depends(require_admin)])
def admin_submit(doc: dict[str, Any], submitted_by: str = "api") -> dict[str, str]:
    """Gửi tài liệu JSON (chuẩn schema 02) vào hàng chờ duyệt."""
    try:
        with connect() as conn:
            review_id = submit_for_review(conn, doc, submitted_by)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    return {"review_id": review_id, "status": "PENDING"}


@app.get("/api/admin/reviews", dependencies=[Depends(require_admin)])
def admin_reviews(status: str = "PENDING") -> list[dict[str, Any]]:
    with connect() as conn:
        return conn.execute(
            """SELECT review_id, created_at, submitted_by, status, reviewer, review_note, created_protocol_id,
                      payload->'protocol_core'->>'protocol_title' AS title,
                      payload->'source_metadata'->>'organization_code' AS organization
               FROM knowledge_review_queue WHERE status = %s ORDER BY created_at DESC LIMIT 200""",
            (status,),
        ).fetchall()


@app.post("/api/admin/reviews/{review_id}", dependencies=[Depends(require_admin)])
def admin_review(review_id: str, decision: ReviewDecision) -> dict[str, Any]:
    try:
        with connect() as conn:
            pid = review(conn, get_assistant().embedder, review_id, decision.approve, decision.reviewer, decision.note)
    except LookupError as exc:
        raise HTTPException(404, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(409, str(exc)) from exc
    return {"status": "APPROVED" if decision.approve else "REJECTED", "protocol_id": pid}


@app.get("/api/admin/audit", dependencies=[Depends(require_admin)])
def admin_audit() -> list[dict[str, Any]]:
    with connect() as conn:
        return audit(conn)


@app.get("/api/admin/logs", dependencies=[Depends(require_admin)])
def admin_logs(limit: int = 50, only_negative: bool = False) -> list[dict[str, Any]]:
    with connect() as conn:
        return conn.execute(
            f"""SELECT log_id, created_at, persona_mode, question, red_flags, used_fallback, model, latency_ms,
                       feedback_rating, feedback_note
                FROM qa_logs {"WHERE feedback_rating = -1" if only_negative else ""}
                ORDER BY created_at DESC LIMIT %s""",
            (min(max(limit, 1), 500),),
        ).fetchall()
