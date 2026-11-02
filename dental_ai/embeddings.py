"""Sinh vector embedding 1536 chiều (khớp cột vector(1536) trong schema 01)."""

from __future__ import annotations

import hashlib
import math
import re
import unicodedata
from abc import ABC, abstractmethod

import numpy as np

from .config import Settings, get_settings

DIM = 1536


def strip_accents(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower()).replace("đ", "d")
    return "".join(ch for ch in text if unicodedata.category(ch) != "Mn")


# Hư từ tiếng Việt (bỏ dấu) — không mang nghĩa chuyên môn, gây nhiễu khi so khớp
STOPWORDS = frozenset("""
toi em anh chi minh ban bac si oi nhe vay roi bi khi thi phai lam sao cua va la co khong ko nhu the
nao nay do de duoc cho voi mot cac nhung nen gi se da dang rat qua hay hoac neu trong tren duoi ve tu
den ma cung con lai ra vao len nhieu it hoi bao lau can muon
""".split())


class Embedder(ABC):
    name: str
    # Trọng số RRF dành cho vector (phần còn lại cho từ khoá). Embedding offline
    # yếu hơn mô hình ngữ nghĩa thật nên cân bằng 50/50.
    vector_weight: float = 0.70
    # Ngưỡng cosine để coi là "DB có dữ liệu liên quan" (xem fallback.should_trigger_fallback)
    strong_similarity: float = 0.50
    weak_similarity: float = 0.35

    @abstractmethod
    def embed(self, texts: list[str]) -> list[np.ndarray]: ...

    def embed_one(self, text: str) -> np.ndarray:
        return self.embed([text])[0]


class LocalHashEmbedder(Embedder):
    """Embedding offline: băm âm tiết, cặp âm tiết (từ ghép tiếng Việt) và trigram ký tự.

    Không "hiểu" ngữ nghĩa như mô hình thật, nhưng chạy không cần mạng/API key,
    phù hợp để phát triển, kiểm thử và làm phương án dự phòng.
    """

    name = "local-hash-v2"
    vector_weight = 0.50
    strong_similarity = 0.30
    weak_similarity = 0.15

    def _features(self, text: str) -> dict[str, float]:
        words = [w for w in re.split(r"[^0-9a-z]+", strip_accents(text)) if len(w) >= 2 and w not in STOPWORDS]
        feats: dict[str, float] = {}

        def add(key: str, weight: float) -> None:
            feats[key] = feats.get(key, 0.0) + weight

        for i, w in enumerate(words):
            add("w:" + w, 1.0)
            if i + 1 < len(words):
                add("b:" + w + "_" + words[i + 1], 1.5)
            padded = f"#{w}#"
            for j in range(len(padded) - 2):
                add("c:" + padded[j : j + 3], 0.3)
        return feats

    def embed(self, texts: list[str]) -> list[np.ndarray]:
        out = []
        for text in texts:
            vec = np.zeros(DIM, dtype=np.float32)
            for key, weight in self._features(text).items():
                h = hashlib.blake2b(key.encode(), digest_size=8).digest()
                idx = int.from_bytes(h[:4], "little") % DIM
                sign = 1.0 if h[4] & 1 else -1.0
                vec[idx] += sign * math.sqrt(weight)
            norm = float(np.linalg.norm(vec))
            out.append(vec / norm if norm > 0 else vec)
        return out


class OpenAIEmbedder(Embedder):
    def __init__(self, api_key: str, model: str):
        from openai import OpenAI

        self.client = OpenAI(api_key=api_key)
        self.model = model
        self.name = f"openai:{model}"

    def embed(self, texts: list[str]) -> list[np.ndarray]:
        result: list[np.ndarray] = []
        for start in range(0, len(texts), 96):
            batch = texts[start : start + 96]
            resp = self.client.embeddings.create(model=self.model, input=batch, dimensions=DIM)
            result.extend(np.asarray(d.embedding, dtype=np.float32) for d in resp.data)
        return result


def get_embedder(settings: Settings | None = None) -> Embedder:
    s = settings or get_settings()
    provider = s.embedding_provider.lower()
    if provider == "auto":
        provider = "openai" if s.openai_api_key else "local"
    if provider == "openai":
        if not s.openai_api_key:
            raise RuntimeError("EMBEDDING_PROVIDER=openai nhưng chưa có OPENAI_API_KEY")
        return OpenAIEmbedder(s.openai_api_key, s.openai_embedding_model)
    if provider == "local":
        return LocalHashEmbedder()
    raise ValueError(f"EMBEDDING_PROVIDER không hợp lệ: {s.embedding_provider}")
