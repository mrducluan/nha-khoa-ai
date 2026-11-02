"""Định tuyến đối tượng (Dynamic Persona Routing) — Mục 2 của system prompt 04.

Chế độ A (DOCTOR): bác sĩ, nội trú, fellow, sinh viên nha khoa.
Chế độ B (PATIENT): bệnh nhân / người dùng phổ thông.
Chế độ C (CONTENT): đội nội dung viết kịch bản video ngắn TikTok/Reels/Shorts theo DNA thương hiệu.
Người dùng có thể chọn vai trò trên giao diện; "auto" sẽ dùng bộ chấm điểm từ khoá.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .embeddings import strip_accents

DOCTOR, PATIENT, CONTENT = "DOCTOR", "PATIENT", "CONTENT"

# Từ khoá đã bỏ dấu, viết thường
_CLINICAL_TERMS = [
    "ncm", "torque", "isq", "cbct", "rbh", "dbbm", "pico", "flap", "rpm", "mbl", "hba1c",
    "chi dinh", "chong chi dinh", "phac do", "stage", "grade", "iti", "sac", "miller", "cairo",
    "consensus", "guideline", "meta-analysis", "meta analysis", "rct", "p-value", "95% ci",
    "survival rate", "marginal bone", "osseointegration", "tich hop xuong", "abutment", "mua",
    "schneiderian", "transcrestal", "lateral window", "osteotome", "piezo", "bisphosphonate",
    "srp", "scaling", "root planing", "vat", "ghep", "membrane", "collagen", "prf", "emdogain",
    "cantilever", "a-p spread", "zirconia", "lithium disilicate", "e.max", "etching", "silane",
    "bonding", "cement", "aligner", "attachment", "ipr", "torque", "anchorage", "mini-vis",
    "bien chung", "xu tri", "co che", "sinh benh hoc", "mo hoc", "lieu luong", "mg", "khang sinh du phong",
    "noi tru", "fellow", "resident", "sinh vien", "bac si", "dong nghiep", "ca lam sang", "benh nhan cua toi",
    "benh nhan nam", "benh nhan nu", "bn nam", "bn nu", "so sanh nghien cuu", "level of evidence", "efp", "ada", "cgdent", "fdi",
]
_PATIENT_TERMS = [
    "toi bi", "em bi", "minh bi", "con toi", "con em", "be nha", "me toi", "bo toi", "rang toi", "rang em",
    "co sao khong", "co nguy hiem", "co dau khong", "bao lau", "bao nhieu tien", "gia bao nhieu", "chi phi",
    "toi so", "em so", "so dau", "so qua", "lo lang", "lo qua", "phai lam sao", "lam sao", "nen lam gi", "co nen", "co can",
    "dau rang", "nhuc rang", "e buot", "e rang", "chay mau chan rang", "chay mau nuou", "hoi mieng", "lung lay",
    "rang ho", "bi ho", "rang mom", "bi mom", "rang khon", "sau rang", "nieng rang", "boc su", "trong rang", "tay trang",
    "an gi", "kieng gi", "o nha", "chai rang", "sung ma", "sung nuou",
]

# Yêu cầu sản xuất nội dung (đã bỏ dấu): chỉ cần 1 từ khoá là chuyển sang Chế độ C
_CONTENT_TERMS = [
    "kich ban", "tiktok", "tik tok", "reels", "reel", "shorts", "video ngan", "hook", "caption", "hashtag",
    "storyboard", "voice over", "voiceover", "phan canh", "series video", "kenh tiktok", "fanpage",
    "bai dang", "viet content", "y tuong video", "quay video", "dung video",
]


@dataclass
class PersonaDecision:
    mode: str
    doctor_score: int
    patient_score: int
    reason: str


def _score(text: str, terms: list[str]) -> int:
    return sum(1 for t in terms if re.search(r"(?<![a-z0-9])" + re.escape(t) + r"(?![a-z0-9])", text))


def detect_persona(question: str, requested: str | None = "auto") -> PersonaDecision:
    req = (requested or "auto").upper()
    if req in (DOCTOR, PATIENT, CONTENT):
        return PersonaDecision(req, 0, 0, "Người dùng chọn vai trò")
    text = strip_accents(question)
    if _score(text, _CONTENT_TERMS):
        return PersonaDecision(CONTENT, 0, 0, "Yêu cầu sản xuất nội dung video ngắn")
    d, p = _score(text, _CLINICAL_TERMS), _score(text, _PATIENT_TERMS)
    # Số liệu kỹ thuật (VD: 35 Ncm, 6mm, 875mg) là dấu hiệu mạnh của câu hỏi chuyên môn
    if re.search(r"\d+(\.\d+)?\s*(ncm|mm|mg|rpm|%)", text):
        d += 2
    if d > p:
        return PersonaDecision(DOCTOR, d, p, "Câu hỏi chứa thuật ngữ chuyên môn")
    # Mặc định an toàn: ngôn ngữ dễ hiểu cho bệnh nhân
    return PersonaDecision(PATIENT, d, p, "Câu hỏi ngôn ngữ đời thường (mặc định an toàn)")
