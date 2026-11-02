"""Cấu hình đọc từ biến môi trường / file .env."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql://postgres:postgres@localhost:5432/dental_rag"

    # --- Claude (sinh câu trả lời) ---
    anthropic_api_key: str | None = None
    claude_model: str = "claude-opus-5-5"
    claude_effort_doctor: str = "high"     # low | medium | high | xhigh | max
    claude_effort_patient: str = "medium"
    claude_max_tokens: int = 16000

    # --- Embedding (tìm kiếm ngữ nghĩa) ---
    # auto  : dùng OpenAI nếu có OPENAI_API_KEY, ngược lại dùng local
    # openai: text-embedding-3-small (1536 chiều, khớp schema vector(1536))
    # local : băm n-gram tiếng Việt, chạy offline không cần API key
    embedding_provider: str = "auto"
    openai_api_key: str | None = None
    openai_embedding_model: str = "text-embedding-3-small"

    # --- Truy xuất ---
    retrieval_top_k: int = 4

    # --- Fallback PubMed (2016–2026) ---
    fallback_enabled: bool = True
    # Để trống = dùng ngưỡng mặc định đã hiệu chỉnh theo loại embedding
    fallback_strong_similarity: float | None = None
    fallback_weak_similarity: float | None = None
    fallback_min_keyword_coverage: float = 0.75
    fallback_require_gold_standard: bool = False
    fallback_max_articles: int = 5
    ncbi_api_key: str | None = None
    ncbi_email: str | None = None

    # --- Quản trị ---
    admin_token: str | None = None  # bắt buộc cho /api/admin/*

    @property
    def system_prompt_path(self) -> Path:
        return ROOT_DIR / "prompts" / "04_master_dental_agent_system_prompt.md"

    @property
    def ingestion_schema_path(self) -> Path:
        return ROOT_DIR / "schemas" / "02_pdf_ingestion_pico_schema.json"

    @property
    def sql_dir(self) -> Path:
        return ROOT_DIR / "db"


@lru_cache
def get_settings() -> Settings:
    return Settings()
