"""Mở rộng truy vấn: ngôn ngữ đời thường / viết tắt → thuật ngữ chuyên môn.

Câu truy vấn TÌM KIẾM = câu gốc + câu đã chuẩn hoá (nếu khác) + thuật ngữ của các chủ đề nhận diện
được (xem intents.py). Câu hỏi gửi cho AI không bị thay đổi.
"""

from __future__ import annotations

from .intents import detect_intents
from .textnorm import normalize, strip_accents


def expand_query(question: str) -> str:
    norm = normalize(question)
    parts = [question]
    if norm != strip_accents(question).strip():
        parts.append(norm)
    parts += [i.expansion for i in detect_intents(norm, normalized=True) if i.expansion]
    return " ".join(parts)
