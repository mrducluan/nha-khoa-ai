"""Bộ điều phối hỏi đáp: Persona → Red flags → Truy xuất lai → Fallback PubMed → Claude → Nhật ký."""

from __future__ import annotations

import json
import logging
import re
import time
from dataclasses import dataclass, field
from typing import Any, Iterator


from .config import Settings, get_settings
from .db import connect
from .embeddings import Embedder, get_embedder
from .fallback import Article, PubMedClient, cache_articles, should_trigger_fallback
from .intents import Intent, coverage, detect_intents, protocol_intents, rerank
from .knowledge import check_embedding_provider
from .llm import ClaudeClient, LLMResult
from .persona import DOCTOR, PATIENT, detect_persona
from .query_expansion import expand_query
from .safety import DOCTOR_DISCLAIMER, PATIENT_DISCLAIMER, RedFlag, detect_red_flags
from .textnorm import normalize
from .scope import OFF_TOPIC_ANSWER, Caution, detect_caution, is_dental_question

log = logging.getLogger(__name__)

MAX_HISTORY_MESSAGES = 8
PATIENT_PAYLOAD_KEYS = (
    "pathophysiology_mechanism", "indications", "contraindications_absolute",
    "contraindications_relative", "patient_friendly_translation",
)


@dataclass
class Prepared:
    question: str
    mode: str
    persona_reason: str
    red_flags: list[RedFlag]
    results: list[dict[str, Any]]
    fallback_reason: str
    articles: list[Article] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    intents: list[Intent] = field(default_factory=list)
    covered: set[str] = field(default_factory=set)
    uncovered: set[str] = field(default_factory=set)
    cautions: list[Caution] = field(default_factory=list)

    def labels(self, codes: set[str]) -> list[str]:
        return [i.label for i in self.intents if i.code in codes]


def search(conn, embedder: Embedder, query: str, top_k: int, specialty: str | None = None) -> list[dict[str, Any]]:
    """Tìm kiếm lai (vector + từ khoá) rồi xếp hạng lại theo chủ đề câu hỏi."""
    intents = detect_intents(query)
    expanded = expand_query(query)
    vec = embedder.embed_one(expanded)
    rows = conn.execute(
        "SELECT * FROM search_dental_knowledge_v2(%s::text, %s::vector, %s::dental_specialty_enum, %s::int, %s::numeric)",
        (expanded, vec, specialty, max(top_k * 3, 10), embedder.vector_weight),
    ).fetchall()
    for r in rows:
        r["protocol_id"] = str(r["protocol_id"])
        r["best_vector_similarity"] = float(r["best_vector_similarity"])
        r["hybrid_rrf_score"] = float(r["hybrid_rrf_score"])
        r["topic_codes"] = sorted(protocol_intents(r))
    return rerank(intents, rows)[:top_k]


_FOLLOW_UP = re.compile(
    r"^(con|the con|vay|nhu vay|neu|the|thi|vay thi|sau do|luc do|truong hop)\b|thi sao|the nao|duoc khong|co sao|"
    r"bao lau|co dau|co nen|co can|loai nao|cach nao|cai do|cai nay|nhu vay|truong hop (do|nay)"
)


def is_follow_up(question: str, previous: str) -> bool:
    """Câu hỏi nối tiếp câu trước? (VD: "Còn nếu tôi bị tiểu đường thì sao?")

    Chỉ coi là nối tiếp khi câu trước thuộc nha khoa, câu hiện tại ngắn, KHÔNG có chủ đề nha khoa riêng
    và có dấu hiệu nối tiếp hoặc nói về bệnh nền/đối tượng đặc biệt của người hỏi.
    """
    if len(question) > 160 or not is_dental_question(previous):
        return False
    if any(i.clinical for i in detect_intents(question)):
        return False                      # câu mới có chủ đề riêng → tìm theo câu mới
    return bool(_FOLLOW_UP.search(normalize(question)) or detect_caution(question))


def source_summary(r: dict[str, Any]) -> dict[str, Any]:
    return {
        "protocol_id": r["protocol_id"],
        "title": r["protocol_title"],
        "organization": r["organization_code"],
        "year": r["publication_year"],
        "evidence_level": r["evidence_level"],
        "doi_or_pmid": r["doi_or_pmid"],
        "slot_role": r["slot_role"],
        "similarity": r["best_vector_similarity"],
        "score": r["hybrid_rrf_score"],
    }


def format_context(mode: str, results: list[dict[str, Any]], articles: list[Article]) -> str:
    parts = ["<ngu_canh_truy_xuat>"]
    if not results and not articles:
        parts.append("KHÔNG CÓ phác đồ nào trong cơ sở dữ liệu khớp với câu hỏi.")
    for i, r in enumerate(results, 1):
        tag = f"[{r['organization_code']} | {r['publication_year']} | {r['evidence_level']}]"
        payload = r["clinical_payload"]
        if mode == PATIENT:
            payload = {k: payload.get(k) for k in PATIENT_PAYLOAD_KEYS if k in payload}
        block = {
            "vai_tro": r["slot_role"],
            "the_trich_dan": tag,
            "nguon": {
                "tai_lieu": r["document_title"], "tac_gia": r["authors_or_committee"],
                "tap_chi": r["journal_or_series"], "doi_pmid": r["doi_or_pmid"],
                "cap_khuyen_nghi": r["grade_of_recommendation"],
            },
            "phac_do": r["protocol_title"],
            "chuyen_khoa": r["primary_specialty"],
            "pico": r["pico_structured"],
            "noi_dung_lam_sang": payload,
        }
        if r.get("ada_iti_core_stance"):
            block["quan_diem_ADA_ITI"] = r["ada_iti_core_stance"]
        if r.get("comparative_arbitration"):
            block["doi_chieu_song_song"] = r["comparative_arbitration"]
        if r.get("related_clinical_edges"):
            block["lien_ket_lam_sang"] = r["related_clinical_edges"]
        parts.append(f"### Phác đồ {i} (độ liên quan {r['best_vector_similarity']:.2f})\n"
                     + json.dumps(block, ensure_ascii=False, default=str))
    if articles:
        parts.append("### Y văn bổ sung tự động từ PubMed 2016–2026 (Tier 3 — chưa được bác sĩ thẩm định, chỉ dùng tham khảo)")
        for a in articles:
            parts.append(json.dumps({
                "the_trich_dan": a.citation_tag, "tieu_de": a.title, "doi": a.doi,
                "loai_bai": a.publication_types, "tom_tat": a.abstract[:3500],
            }, ensure_ascii=False))
    parts.append("</ngu_canh_truy_xuat>")
    return "\n\n".join(parts)


def build_user_message(prep: Prepared) -> str:
    mode_line = ("CHẾ ĐỘ: A — CLINICAL PRO & ACADEMIC MODE (người hỏi là bác sĩ/nội trú/sinh viên)"
                 if prep.mode == DOCTOR else
                 "CHẾ ĐỘ: B — PATIENT EDUCATION & EMPATHY MODE (người hỏi là bệnh nhân/người dân)")
    lines = [mode_line]
    if prep.red_flags:
        lines.append("CẢNH BÁO ĐỎ (hệ thống phát hiện): " + " | ".join(f.code for f in prep.red_flags))
    if prep.intents:
        lines.append("CHỦ ĐỀ CÂU HỎI: " + "; ".join(i.label for i in prep.intents))
    if prep.uncovered:
        lines.append("CHƯA CÓ PHÁC ĐỒ TRONG CƠ SỞ DỮ LIỆU CHO: " + "; ".join(prep.labels(prep.uncovered))
                     + " — nói rõ điều này với người hỏi; chỉ dùng y văn bổ sung (nếu có) hoặc thông tin chung an toàn, "
                       "không suy diễn từ phác đồ của chủ đề khác.")
    if any(i.code == "COST" for i in prep.intents):
        lines.append("HỆ THỐNG KHÔNG CÓ DỮ LIỆU GIÁ: không đưa ra con số chi phí; giải thích các yếu tố ảnh hưởng chi phí "
                     "và khuyên hỏi trực tiếp cơ sở nha khoa.")
    if prep.cautions:
        lines.append("ĐỐI TƯỢNG ĐẶC BIỆT (bắt buộc lồng ghép lưu ý vào câu trả lời): "
                     + " | ".join(f"{c.label}: {c.message}" for c in prep.cautions))
    lines.append(format_context(prep.mode, prep.results, prep.articles))
    lines.append(f"<cau_hoi>\n{prep.question}\n</cau_hoi>")
    return "\n\n".join(lines)


def render_offline_answer(prep: Prepared) -> str:
    """Câu trả lời trích thẳng từ CSDL khi chưa cấu hình Claude API (chế độ dự phòng)."""
    if prep.intents and prep.uncovered and not prep.covered:
        return ("Hiện cơ sở dữ liệu chưa có phác đồ về **" + ", ".join(prep.labels(prep.uncovered)) + "**. "
                "Vui lòng hỏi trực tiếp bác sĩ nha khoa để được thăm khám và tư vấn chính xác.")
    if not prep.results:
        return ("Hiện cơ sở dữ liệu chưa có phác đồ phù hợp với câu hỏi này. "
                "Vui lòng hỏi bác sĩ nha khoa để được thăm khám trực tiếp.")
    r = prep.results[0]
    p = r["clinical_payload"]
    tag = f"[{r['organization_code']} | {r['publication_year']} | {r['evidence_level']}]"
    if prep.mode == PATIENT:
        pt = p.get("patient_friendly_translation", {})
        care = "\n".join(f"- {x}" for x in pt.get("home_care_instructions", []))
        return (f"### {r['protocol_title']}\n\n**Đây là gì?** {pt.get('what_is_it', '')}\n\n"
                f"**Vì sao cần?** {pt.get('why_needed', '')}\n\n**Điều gì sẽ diễn ra?** {pt.get('what_to_expect', '')}\n\n"
                f"**Chăm sóc tại nhà:**\n{care}\n\n*Nguồn: {tag}*")
    steps = "\n".join(f"{s['step']}. **{s['phase_name']}** — {s['clinical_action']} _(Thông số: {s['technical_parameters']})_"
                      for s in p.get("step_by_step_procedure", []))
    pico = r["pico_structured"]
    return (f"### {r['protocol_title']} {tag}\n\n**PICO — O:** {pico.get('O_outcome_metrics', '')}\n\n"
            f"**Chỉ định:**\n" + "\n".join(f"- {x}" for x in p.get("indications", [])) +
            "\n\n**Chống chỉ định tuyệt đối:**\n" + "\n".join(f"- {x}" for x in p.get("contraindications_absolute", [])) +
            f"\n\n**Quy trình:**\n{steps}")


class Assistant:
    def __init__(self, settings: Settings | None = None, embedder: Embedder | None = None,
                 llm: ClaudeClient | None = None, pubmed: PubMedClient | None = None):
        self.settings = settings or get_settings()
        self.embedder = embedder or get_embedder(self.settings)
        self._llm = llm
        self.pubmed = pubmed

    @property
    def llm(self) -> ClaudeClient | None:
        if self._llm is None and self.settings.anthropic_api_key:
            self._llm = ClaudeClient(self.settings)
        return self._llm

    # ------------------------------------------------------------------
    def prepare(self, conn, question: str, role: str | None, history: list[dict] | None,
                specialty: str | None = None) -> Prepared:
        question = question.strip()
        persona = detect_persona(question, role)
        flags = detect_red_flags(question)
        prior_user = [m["content"] for m in (history or []) if m.get("role") == "user"]
        retrieval_query = f"{prior_user[-1]} {question}" if prior_user and is_follow_up(question, prior_user[-1]) else question
        results = search(conn, self.embedder, retrieval_query, self.settings.retrieval_top_k, specialty)
        intents = detect_intents(retrieval_query)
        covered, uncovered = coverage(intents, results)
        if covered:
            # Chỉ giữ phác đồ cùng chủ đề: tránh đưa phác đồ không liên quan vào câu trả lời
            results = [r for r in results if set(r["topic_codes"]) & covered] or results
        elif uncovered:
            results = []
        prep = Prepared(question, persona.mode, persona.reason, flags, results, "",
                        intents=intents, covered=covered, uncovered=uncovered, cautions=detect_caution(question))
        warning = check_embedding_provider(conn, self.embedder)
        if warning:
            prep.warnings.append(warning)

        trigger, prep.fallback_reason = should_trigger_fallback(results, question, self.settings, self.embedder)
        if trigger and self.llm is not None:
            pq = self.llm.build_pubmed_query(question)
            if pq and pq.is_dental_question and pq.english_keywords.strip():
                client = self.pubmed or PubMedClient(self.settings)
                prep.articles = client.search(pq.english_keywords)
                if prep.articles:
                    cache_articles(conn, prep.articles, pq.english_keywords)
                prep.fallback_reason += f" → PubMed: “{pq.english_keywords}” ({len(prep.articles)} bài)"
        return prep

    def _messages(self, prep: Prepared, history: list[dict] | None) -> list[dict]:
        msgs = [{"role": m["role"], "content": str(m["content"])}
                for m in (history or [])[-MAX_HISTORY_MESSAGES:]
                if m.get("role") in ("user", "assistant") and m.get("content")]
        while msgs and msgs[0]["role"] != "user":
            msgs.pop(0)
        msgs.append({"role": "user", "content": build_user_message(prep)})
        return msgs

    # ------------------------------------------------------------------
    def stream(self, question: str, role: str | None = "auto", history: list[dict] | None = None,
               specialty: str | None = None) -> Iterator[dict[str, Any]]:
        """Sinh các sự kiện: meta → delta* → done."""
        started = time.monotonic()
        prior_user = [m["content"] for m in (history or []) if m.get("role") == "user"]
        in_scope = is_dental_question(question) or (
            bool(prior_user) and is_follow_up(question, prior_user[-1]))
        if not in_scope:
            yield from self._off_topic(question, role, started)
            return
        with connect(self.settings.database_url) as conn:
            prep = self.prepare(conn, question, role, history, specialty)
            yield {
                "type": "meta",
                "mode": prep.mode,
                "persona_reason": prep.persona_reason,
                "red_flags": [{"code": f.code, "message": f.message} for f in prep.red_flags],
                "sources": [source_summary(r) for r in prep.results],
                "literature": [a.as_dict() for a in prep.articles],
                "fallback": prep.fallback_reason,
                "warnings": prep.warnings,
                "intents": [{"code": i.code, "label": i.label} for i in prep.intents],
                "uncovered": prep.labels(prep.uncovered),
                "cautions": [{"code": c.code, "label": c.label, "message": c.message} for c in prep.cautions],
                "off_topic": False,
            }

            answer, model, result = "", None, None
            if self.llm is None:
                answer = render_offline_answer(prep)
                model = "offline-database"
                yield {"type": "delta", "text": answer}
            else:
                effort = self.settings.claude_effort_doctor if prep.mode == DOCTOR else self.settings.claude_effort_patient
                try:
                    for item in self.llm.stream_answer(self._messages(prep, history), effort):
                        if isinstance(item, LLMResult):
                            result = item
                        else:
                            yield {"type": "delta", "text": item}
                except Exception as exc:  # lỗi mạng/API: trả dữ liệu gốc thay vì im lặng
                    log.exception("Lỗi gọi Claude API")
                    fallback_text = ("\n\n> ⚠️ Không kết nối được dịch vụ AI (" + type(exc).__name__ +
                                     "). Dưới đây là nội dung trích trực tiếp từ cơ sở dữ liệu:\n\n" + render_offline_answer(prep))
                    yield {"type": "delta", "text": fallback_text}
                    answer = fallback_text
                if result:
                    answer, model = result.text, result.model
                    if result.refused:
                        msg = ("Xin lỗi, hệ thống không thể trả lời câu hỏi này. "
                               "Vui lòng diễn đạt lại hoặc liên hệ trực tiếp bác sĩ.")
                        yield {"type": "delta", "text": msg}
                        answer = msg

            disclaimer = "\n\n---\n" + (PATIENT_DISCLAIMER if prep.mode == PATIENT else DOCTOR_DISCLAIMER)
            yield {"type": "delta", "text": disclaimer}
            answer += disclaimer

            log_id = conn.execute(
                """INSERT INTO qa_logs (persona_mode, question, answer, protocol_ids, red_flags, used_fallback,
                       fallback_pmids, model, latency_ms)
                   VALUES (%s,%s,%s,%s::uuid[],%s,%s,%s,%s,%s) RETURNING log_id""",
                (prep.mode, question, answer, [r["protocol_id"] for r in prep.results],
                 [f.code for f in prep.red_flags], bool(prep.articles), [a.pmid for a in prep.articles],
                 model, int((time.monotonic() - started) * 1000)),
            ).fetchone()["log_id"]
            yield {"type": "done", "log_id": str(log_id), "model": model,
                   "usage": result.usage if result else {}}

    def _off_topic(self, question: str, role: str | None, started: float) -> Iterator[dict[str, Any]]:
        mode = detect_persona(question, role).mode
        yield {"type": "meta", "mode": mode, "persona_reason": "", "red_flags": [], "sources": [], "literature": [],
               "fallback": "Ngoài phạm vi nha khoa", "warnings": [], "intents": [], "uncovered": [], "cautions": [],
               "off_topic": True}
        yield {"type": "delta", "text": OFF_TOPIC_ANSWER}
        with connect(self.settings.database_url) as conn:
            log_id = conn.execute(
                """INSERT INTO qa_logs (persona_mode, question, answer, model, latency_ms)
                   VALUES (%s,%s,%s,%s,%s) RETURNING log_id""",
                (mode, question, OFF_TOPIC_ANSWER, "scope-filter", int((time.monotonic() - started) * 1000)),
            ).fetchone()["log_id"]
        yield {"type": "done", "log_id": str(log_id), "model": "scope-filter", "usage": {}}

    def ask(self, question: str, role: str | None = "auto", history: list[dict] | None = None,
            specialty: str | None = None) -> dict[str, Any]:
        meta, text, done = {}, [], {}
        for event in self.stream(question, role, history, specialty):
            if event["type"] == "meta":
                meta = event
            elif event["type"] == "delta":
                text.append(event["text"])
            else:
                done = event
        return {**{k: v for k, v in meta.items() if k != "type"}, "answer": "".join(text),
                "log_id": done.get("log_id"), "model": done.get("model"), "usage": done.get("usage")}
