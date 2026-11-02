"""Xác minh trích dẫn: đối chiếu DOI trong dental_sources với Crossref (tên bài, năm).

Chạy:  python -m dental_ai verify-citations
Một hệ thống tư vấn y khoa chỉ đáng tin khi mọi trích dẫn có thật và đúng — hãy chạy lệnh này
sau mỗi lần nạp dữ liệu mới.
"""

from __future__ import annotations

import difflib
import re
from typing import Any

import httpx

CROSSREF = "https://api.crossref.org/works/"


def _norm(text: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", " ", (text or "").lower()).strip()


def check_doi(http: httpx.Client, doi: str, title: str, year: int) -> dict[str, Any]:
    if not doi or not doi.startswith("10."):
        return {"status": "KHÔNG_CÓ_DOI", "detail": "Không phải DOI — cần xác minh thủ công"}
    try:
        resp = http.get(CROSSREF + doi)
    except httpx.HTTPError as exc:
        return {"status": "LỖI_MẠNG", "detail": str(exc)}
    if resp.status_code == 404:
        return {"status": "DOI_KHÔNG_TỒN_TẠI", "detail": "Crossref không tìm thấy DOI này"}
    if resp.status_code != 200:
        return {"status": "LỖI_MẠNG", "detail": f"HTTP {resp.status_code}"}
    msg = resp.json().get("message", {})
    real_title = (msg.get("title") or [""])[0]
    parts = (msg.get("issued") or msg.get("published") or {}).get("date-parts") or [[None]]
    real_year = parts[0][0]
    similarity = difflib.SequenceMatcher(None, _norm(title), _norm(real_title)).ratio()
    problems = []
    if similarity < 0.6:
        problems.append(f"tên bài khác (giống {similarity:.0%})")
    if real_year and abs(int(real_year) - int(year)) > 1:
        problems.append(f"năm thật {real_year} ≠ {year}")
    return {
        "status": "KHỚP" if not problems else "SAI_LỆCH",
        "detail": "; ".join(problems) or f"giống {similarity:.0%}",
        "crossref_title": real_title,
        "crossref_year": real_year,
        "crossref_journal": (msg.get("container-title") or [""])[0],
    }


def verify_all(conn, http: httpx.Client | None = None) -> list[dict[str, Any]]:
    http = http or httpx.Client(timeout=15, headers={"User-Agent": "nha-khoa-ai/1.0 (citation check)"})
    rows = conn.execute(
        """SELECT organization_code, publication_year, doi_or_pmid, document_title
           FROM dental_sources ORDER BY organization_code, publication_year"""
    ).fetchall()
    return [{**r, **check_doi(http, r["doi_or_pmid"], r["document_title"], r["publication_year"])} for r in rows]
