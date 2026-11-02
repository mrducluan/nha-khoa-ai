"""Fallback y văn tự động 2016–2026 (nâng cấp từ legacy/03_auto_fallback_literature_ingestor.py).

Thay đổi so với bản gốc:
  * Quyết định kích hoạt dựa trên độ tương đồng cosine (0..1) thay vì điểm RRF
    (~0.02) — bản gốc so RRF với ngưỡng 0.78 nên LUÔN kích hoạt.
  * Câu hỏi tiếng Việt được chuyển thành từ khoá tiếng Anh (PubMed chỉ tìm tiếng Anh).
  * Lỗi mạng không còn bị trả về như một "bài báo" giả; dùng httpx + timeout + api_key NCBI.
  * Đọc đủ abstract có thẻ con (<i>, <sup>…), năm dạng MedlineDate, DOI, loại bài báo.
  * Bài JADA chỉ được xếp Tier 1 (ADA) khi là Practice Guideline — một bài nghiên cứu
    bất kỳ đăng trên JADA không phải là hướng dẫn chính thức của ADA.
  * Kết quả được lưu đệm vào bảng literature_cache.
"""

from __future__ import annotations

import logging
import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from typing import Any

import httpx
import psycopg

from .config import Settings, get_settings

log = logging.getLogger(__name__)

NCBI_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

TRUSTED_JOURNALS = [
    "Journal of the American Dental Association",
    "Clinical Oral Implants Research",
    "Clinical Oral Investigations",
    "Journal of Clinical Periodontology",
    "Journal of Periodontology",
    "International Journal of Oral & Maxillofacial Implants",
    "American Journal of Orthodontics and Dentofacial Orthopedics",
    "The Angle Orthodontist",
    "Journal of Prosthetic Dentistry",
    "Journal of Esthetic and Restorative Dentistry",
    "Cochrane Database of Systematic Reviews",
    "British Dental Journal",
    "International Dental Journal",
    "Periodontology 2000",
    "Journal of Dental Research",
    "Journal of Endodontics",
    "International Endodontic Journal",
]
TRUSTED_JOURNALS_FILTER = "(" + " OR ".join(f'"{j}"[Journal]' for j in TRUSTED_JOURNALS) + ")"
EVIDENCE_FILTER = (
    "(Practice Guideline[pt] OR Guideline[pt] OR Consensus Development Conference[pt] OR "
    "Systematic Review[pt] OR Meta-Analysis[pt] OR Randomized Controlled Trial[pt])"
)


@dataclass
class Article:
    pmid: str
    title: str
    journal: str
    publication_year: int | None
    abstract: str
    doi: str | None = None
    publication_types: list[str] = field(default_factory=list)
    organization_code: str = "PUBMED_NCBI"
    authority_tier: str = "TIER_3_PEER_REVIEWED"

    @property
    def evidence_label(self) -> str:
        types = " ".join(self.publication_types).lower()
        if "meta-analysis" in types or "systematic review" in types:
            return "1A"
        if "randomized controlled trial" in types:
            return "1B"
        if "guideline" in types or "consensus" in types:
            return "Consensus"
        return "N/A"

    @property
    def citation_tag(self) -> str:
        return f"[{self.organization_code} – {self.journal} | {self.publication_year or 'n.d.'} | {self.evidence_label} | PMID:{self.pmid}]"

    def as_dict(self) -> dict[str, Any]:
        return {**self.__dict__, "citation_tag": self.citation_tag, "evidence_label": self.evidence_label}


_EXTRA_COMMON = {"nho", "dung", "tuoi", "hai", "the", "xu", "dau"}


def keyword_coverage(question: str, results: list[dict[str, Any]]) -> float:
    """Tỷ lệ âm tiết nội dung của câu hỏi xuất hiện trong các chunk khớp tốt nhất."""
    from .embeddings import STOPWORDS, strip_accents

    def toks(text: str) -> set[str]:
        return {w for w in re.split(r"[^0-9a-z]+", strip_accents(text))
                if len(w) >= 2 and w not in STOPWORDS and w not in _EXTRA_COMMON}

    q = toks(question) - {"rang", "nha", "khoa", "benh", "nhan", "dieu", "tri"}
    if not q:
        return 0.0
    best = 0.0
    for r in results:
        doc = toks(" ".join(c.get("text", "") for c in (r.get("matched_chunks") or [])))
        best = max(best, len(q & doc) / len(q))
    return best


def should_trigger_fallback(results: list[dict[str, Any]], question: str = "",
                            settings: Settings | None = None, embedder: Any = None) -> tuple[bool, str]:
    """Quyết định có bổ sung y văn PubMed hay không.

    DB được coi là đủ khi: tương đồng ngữ nghĩa cao (≥ strong) HOẶC
    tương đồng vừa (≥ weak) và phủ phần lớn từ khoá câu hỏi (≥ 75%).
    Fallback chỉ BỔ SUNG y văn (không thay thế dữ liệu DB) nên khi còn nghi ngờ thì kích hoạt.
    """
    s = settings or get_settings()
    if not s.fallback_enabled:
        return False, "Fallback đang tắt"
    if not results:
        return True, "Không tìm thấy phác đồ liên quan trong cơ sở dữ liệu"

    # 1) Ưu tiên quyết định theo CHỦ ĐỀ: câu hỏi thuộc chủ đề nào, CSDL có phác đồ cho chủ đề đó không
    from .intents import BY_CODE, coverage, detect_intents

    intents = detect_intents(question) if question else []
    if any(i.clinical for i in intents):
        covered, uncovered = coverage(intents, results)
        names = lambda codes: ", ".join(BY_CODE[c].label for c in sorted(codes))  # noqa: E731
        if not covered:
            return True, f"Chủ đề chưa có phác đồ trong cơ sở dữ liệu: {names(uncovered)}"
        if uncovered:
            return True, f"Có phác đồ cho {names(covered)}; chưa có cho {names(uncovered)} → tra cứu bổ sung"
        return False, f"Cơ sở dữ liệu có phác đồ cho chủ đề: {names(covered)}"

    # 2) Không nhận diện được chủ đề → dựa vào độ tương đồng + độ phủ từ khoá
    strong = s.fallback_strong_similarity or getattr(embedder, "strong_similarity", 0.50)
    weak = s.fallback_weak_similarity or getattr(embedder, "weak_similarity", 0.35)
    best = max(float(r.get("best_vector_similarity") or 0) for r in results)
    coverage = keyword_coverage(question, results) if question else 0.0
    detail = f"tương đồng {best:.2f}, phủ từ khoá {coverage:.0%}"
    if s.fallback_require_gold_standard and not any(r.get("slot_role") == "PRIMARY_ADA_ITI_STANDARD" for r in results):
        return True, f"Thiếu phác đồ chuẩn vàng ADA/ITI ({detail})"
    if best >= strong or (best >= weak and coverage >= s.fallback_min_keyword_coverage):
        return False, f"Cơ sở dữ liệu đủ thông tin ({detail})"
    return True, f"Dữ liệu trong cơ sở dữ liệu chưa đủ chắc chắn ({detail})"


def build_query(keywords: str, start_year: int = 2016, end_year: int = 2026, strict: bool = True) -> str:
    query = f"({keywords}) AND {TRUSTED_JOURNALS_FILTER}"
    if strict:
        date_filter = f'("{start_year}/01/01"[Date - Publication] : "{end_year}/12/31"[Date - Publication])'
        query += f" AND {EVIDENCE_FILTER} AND {date_filter}"
    return query


def classify_source(journal: str, publication_types: list[str]) -> tuple[str, str]:
    j = journal.lower()
    is_guideline = any("guideline" in t.lower() or "consensus" in t.lower() for t in publication_types)
    if "american dental association" in j:
        return ("ADA", "TIER_1_GOLD_STANDARD") if is_guideline else ("ELSEVIER", "TIER_3_PEER_REVIEWED")
    if "clinical oral investigations" in j:
        return "SPRINGER_COI", "TIER_3_PEER_REVIEWED"
    if "cochrane" in j:
        return "COCHRANE", "TIER_3_PEER_REVIEWED"
    if "international dental journal" in j:
        return ("FDI", "TIER_2_INTERNATIONAL_GUIDE") if is_guideline else ("ELSEVIER", "TIER_3_PEER_REVIEWED")
    if "clinical oral implants research" in j or "periodontology" in j:
        return "WILEY", "TIER_3_PEER_REVIEWED"
    if "prosthetic dentistry" in j or "orthodontics and dentofacial" in j:
        return "ELSEVIER", "TIER_3_PEER_REVIEWED"
    return "PUBMED_NCBI", "TIER_3_PEER_REVIEWED"


def _text(elem: ET.Element | None) -> str:
    return " ".join("".join(elem.itertext()).split()) if elem is not None else ""


def parse_pubmed_xml(xml_bytes: bytes) -> list[Article]:
    root = ET.fromstring(xml_bytes)
    articles = []
    for node in root.findall(".//PubmedArticle"):
        pmid = node.findtext(".//MedlineCitation/PMID", default="").strip()
        if not pmid:
            continue
        journal = node.findtext(".//Article/Journal/Title", default="").strip()
        year_text = node.findtext(".//Article/Journal/JournalIssue/PubDate/Year") or \
            node.findtext(".//Article/Journal/JournalIssue/PubDate/MedlineDate") or ""
        m = re.search(r"(19|20)\d{2}", year_text)
        sections = []
        for abs_elem in node.findall(".//Article/Abstract/AbstractText"):
            label = abs_elem.get("Label")
            body = _text(abs_elem)
            if body:
                sections.append(f"{label}: {body}" if label else body)
        doi = None
        for aid in node.findall(".//PubmedData/ArticleIdList/ArticleId"):
            if aid.get("IdType") == "doi" and aid.text:
                doi = aid.text.strip()
        ptypes = [_text(p) for p in node.findall(".//Article/PublicationTypeList/PublicationType")]
        org, tier = classify_source(journal, ptypes)
        articles.append(Article(
            pmid=pmid, title=_text(node.find(".//Article/ArticleTitle")), journal=journal,
            publication_year=int(m.group(0)) if m else None, abstract=" ".join(sections), doi=doi,
            publication_types=ptypes, organization_code=org, authority_tier=tier,
        ))
    return articles


class PubMedClient:
    def __init__(self, settings: Settings | None = None, http: httpx.Client | None = None):
        self.settings = settings or get_settings()
        self.http = http or httpx.Client(timeout=15.0, follow_redirects=True)

    def _params(self, **extra: Any) -> dict[str, Any]:
        params = {"tool": "nha-khoa-ai", **extra}
        if self.settings.ncbi_api_key:
            params["api_key"] = self.settings.ncbi_api_key
        if self.settings.ncbi_email:
            params["email"] = self.settings.ncbi_email
        return params

    def search_ids(self, query: str, retmax: int) -> list[str]:
        resp = self.http.get(NCBI_BASE_URL + "esearch.fcgi", params=self._params(
            db="pubmed", term=query, retmode="json", retmax=retmax, sort="relevance"))
        resp.raise_for_status()
        return resp.json().get("esearchresult", {}).get("idlist", [])

    def fetch(self, ids: list[str]) -> list[Article]:
        if not ids:
            return []
        resp = self.http.get(NCBI_BASE_URL + "efetch.fcgi", params=self._params(
            db="pubmed", id=",".join(ids), retmode="xml"))
        resp.raise_for_status()
        return parse_pubmed_xml(resp.content)

    def search(self, keywords: str, max_results: int | None = None) -> list[Article]:
        """Tìm 2016–2026 với bộ lọc bằng chứng mạnh; nếu < 2 bài thì nới bộ lọc."""
        n = max_results or self.settings.fallback_max_articles
        try:
            ids = self.search_ids(build_query(keywords, strict=True), n)
            if len(ids) < 2:
                extra = self.search_ids(build_query(keywords, strict=False), n)
                ids += [i for i in extra if i not in ids][: n - len(ids)]
            return self.fetch(ids)
        except (httpx.HTTPError, ET.ParseError, ValueError) as exc:
            log.warning("PubMed fallback lỗi: %s", exc)
            return []


def cache_articles(conn: psycopg.Connection, articles: list[Article], query: str) -> None:
    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO literature_cache (pmid, search_query, title, journal, publication_year,
                   publication_types, doi, abstract, organization_code, authority_tier)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               ON CONFLICT (pmid) DO UPDATE SET fetched_at = NOW(), search_query = EXCLUDED.search_query""",
            [(a.pmid, query, a.title, a.journal, a.publication_year, a.publication_types, a.doi,
              a.abstract, a.organization_code, a.authority_tier) for a in articles],
        )
