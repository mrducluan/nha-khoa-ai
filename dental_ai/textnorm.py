"""Chuẩn hoá câu hỏi tiếng Việt của người dùng thật.

Người dùng gõ: không dấu, viết tắt kiểu chat ("ko", "dc", "j", "ntn"), sai chính tả
("inplant", "soang"), từ địa phương ("răng cấm", "lợi"). Hàm normalize() đưa tất cả về
dạng không dấu, chữ thường, đã thay viết tắt — dùng chung cho mọi bộ nhận diện.
"""

from __future__ import annotations

import re
import unicodedata


def strip_accents(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower()).replace("đ", "d")
    return "".join(ch for ch in text if unicodedata.category(ch) != "Mn")


def lower_nfc(text: str) -> str:
    """Chữ thường, GIỮ dấu — dùng khi bỏ dấu gây nhầm nghĩa (ngất/ngạt, lợi/lời)."""
    return unicodedata.normalize("NFC", text.lower())


# (mẫu regex trên văn bản đã bỏ dấu, thay bằng)
_REPLACEMENTS: list[tuple[str, str]] = [
    # Viết tắt kiểu chat
    (r"\b(ko|k|kh|hk|hok|khg|kg|hong|hem)\b", "khong"),
    (r"\b(dc|dk|duoc)\b", "duoc"),
    (r"\bj\b", "gi"),
    (r"\bntn\b", "nhu the nao"),
    (r"\bbs\b", "bac si"),
    (r"\bnc\b", "nuoc"),
    (r"\bvs\b", "voi"),
    (r"\bbn (nam|nu) (\d+)", r"benh nhan \1 \2"),
    (r"\bbn (tien|lau|tuoi|ngay|thang|nam|lan|cai|tru|rang)\b", r"bao nhieu \1"),
    (r"\b(\d+)\s*t\b", r"\1 tuoi"),
    # Lỗi gõ / phiên âm thường gặp
    (r"\b(inplant|implan|im plant|impland|implants)\b", "implant"),
    (r"\bsoang\b", "xoang"),
    (r"\b(ven ni|vennir|venner|vener|veneers|venia)\b", "veneer"),
    (r"\b(invisalign|invisaline|invisalin|invi)\b", "invisalign"),
    (r"\b(lieng|nieng)\b", "nieng"),
    (r"\bmac cai\b", "mac cai"),
    (r"\b(all ?on ?4|allon4)\b", "all on 4"),
    (r"\b(all ?on ?6|allon6)\b", "all on 6"),
    # Từ địa phương / đồng nghĩa
    (r"\brang cam\b", "rang ham"),
    # "loi" không dấu có thể là lợi/lời/lỗi → chỉ đổi khi đứng cạnh từ nha khoa
    (r"\b(mau|sung|viem|tut|chan|ho|cuoi ho|chay mau) loi\b", r"\1 nuou"),
    (r"\bloi (bi|sung|tut|chay|do|viem|teo|ho)\b", r"nuou \1"),
    (r"\brang so 8\b|\brang 8\b|\brang thu 8\b", "rang khon"),
]
_COMPILED = [(re.compile(p), r) for p, r in _REPLACEMENTS]


def normalize(text: str) -> str:
    """Không dấu + chữ thường + thay viết tắt/đồng nghĩa + gộp khoảng trắng."""
    t = lower_nfc(text).replace("lợi", "nướu")   # "lợi" (miền Bắc) = "nướu"; có dấu nên không nhầm lời/lỗi
    t = re.sub(r"\bbn (nam|nữ)\b", r"bệnh nhân \1", t)  # "BN nam/nữ" ≠ "bn năm" (bao nhiêu năm)
    t = strip_accents(t)
    t = re.sub(r"[^0-9a-z%.,/ \-]+", " ", t)
    for pattern, repl in _COMPILED:
        t = pattern.sub(repl, t)
    return re.sub(r"\s+", " ", t).strip()
