"""Định tuyến đối tượng (Dynamic Persona Routing) — Mục 2 của system prompt 04.

Chế độ A (DOCTOR): bác sĩ, nội trú, fellow, sinh viên nha khoa.
Chế độ B (PATIENT): bệnh nhân / người dùng phổ thông.
Người dùng có thể chọn vai trò trên giao diện; "auto" sẽ dùng bộ chấm điểm từ khoá.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .textnorm import normalize

DOCTOR, PATIENT = "DOCTOR", "PATIENT"

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
    "noi tru", "fellow", "resident", "sinh vien", "dong nghiep", "ca lam sang", "benh nhan cua toi",
    "overcorrection", "jumping gap", "cochrane", "type 1a", "insertion torque", "lindhe", "bio-oss", "dbbm",
    "resin cement", "survival rate", "ty le song con", "muc do chinh xac", "bang chung", "khu tru", "dan luu",
    "khang sinh toan than", "nhiem ban", "tai luc tuc thi", "ghep xuong", "vach ngoai", "phim cbct", "on dinh so khoi",
    "toan than", "tien luong", "chan doan phan biet", "ky thuat", "giai doan", "stage iii", "grade b", "tads",
    "benh nhan nam", "benh nhan nu", "bn nam", "bn nu", "so sanh nghien cuu", "level of evidence", "efp", "ada", "cgdent", "fdi",
]
_PATIENT_TERMS = [
    "toi bi", "em bi", "minh bi", "con toi", "con em", "be nha", "me toi", "bo toi", "rang toi", "rang em",
    "co sao khong", "co nguy hiem", "co dau khong", "bao lau", "bao nhieu tien", "gia bao nhieu", "chi phi",
    "toi so", "em so", "so dau", "so qua", "lo lang", "lo qua", "phai lam sao", "lam sao", "nen lam gi", "co nen", "co can",
    "dau rang", "nhuc rang", "e buot", "e rang", "chay mau chan rang", "chay mau nuou", "hoi mieng", "lung lay",
    "rang ho", "bi ho", "rang mom", "bi mom", "rang khon", "sau rang", "nieng rang", "boc su", "trong rang", "tay trang",
    "an gi", "kieng gi", "o nha", "chai rang", "sung ma", "sung nuou",
    "bac si oi", "thua bac si", "cho (em|toi|minh) hoi", "toi muon", "em muon", "minh muon", "bo toi", "ong toi", "ba toi",
    "chong toi", "vo toi", "be nha", "con toi", "co duoc khong", "duoc khong", "phai khong", "co ben khong", "co tot khong",
]


@dataclass
class PersonaDecision:
    mode: str
    doctor_score: int
    patient_score: int
    reason: str


def _score(text: str, terms: list[str]) -> int:
    def pat(t: str) -> str:
        return t if "(" in t else re.escape(t)   # cho phép một số mẫu regex đơn giản
    return sum(1 for t in terms if re.search(r"(?<![a-z0-9])" + pat(t) + r"(?![a-z0-9])", text))


def detect_persona(question: str, requested: str | None = "auto") -> PersonaDecision:
    req = (requested or "auto").upper()
    if req in (DOCTOR, PATIENT):
        return PersonaDecision(req, 0, 0, "Người dùng chọn vai trò")
    text = normalize(question)
    d, p = _score(text, _CLINICAL_TERMS), _score(text, _PATIENT_TERMS)
    # Số liệu kỹ thuật (VD: 35 Ncm, 6mm, 875mg) là dấu hiệu mạnh của câu hỏi chuyên môn
    if re.search(r"\d+(\.\d+)?\s*(ncm|mm|mg|rpm|%)", text):
        d += 2
    # Trích hướng dẫn / phân loại chuyên môn
    if re.search(r"theo (ada|iti|efp|cochrane|fdi|cgdent|eao|aap|aae|guideline)|\bd[1-4]\b|\b(1[1-8]|2[1-8]|3[1-8]|4[1-8])\b(?! tuoi)", text):
        d += 1
    if d > p:
        return PersonaDecision(DOCTOR, d, p, "Câu hỏi chứa thuật ngữ chuyên môn")
    # Mặc định an toàn: ngôn ngữ dễ hiểu cho bệnh nhân
    return PersonaDecision(PATIENT, d, p, "Câu hỏi ngôn ngữ đời thường (mặc định an toàn)")
