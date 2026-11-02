"""Cấu hình kiểm thử.

Kiểm thử tích hợp cần PostgreSQL + pgvector. Đặt TEST_DATABASE_URL (mặc định
postgresql://postgres:postgres@localhost:5432/dental_rag_test). Nếu không kết nối được,
các test cần DB sẽ được bỏ qua (skip).
"""

import os
from urllib.parse import urlparse

import psycopg
import pytest

TEST_DB_URL = os.environ.get("TEST_DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/dental_rag_test")

os.environ["DATABASE_URL"] = TEST_DB_URL
os.environ["EMBEDDING_PROVIDER"] = "local"
os.environ["ANTHROPIC_API_KEY"] = ""
os.environ["OPENAI_API_KEY"] = ""
os.environ["ADMIN_TOKEN"] = "test-admin-token"
os.environ["FALLBACK_ENABLED"] = "true"

from dental_ai.config import get_settings  # noqa: E402

get_settings.cache_clear()


def _recreate_database() -> bool:
    parsed = urlparse(TEST_DB_URL)
    admin_url = TEST_DB_URL.replace(parsed.path, "/postgres")
    dbname = parsed.path.lstrip("/")
    try:
        with psycopg.connect(admin_url, autocommit=True, connect_timeout=3) as conn:
            conn.execute(f'DROP DATABASE IF EXISTS "{dbname}" WITH (FORCE)')
            conn.execute(f'CREATE DATABASE "{dbname}"')
        return True
    except psycopg.OperationalError:
        return False


@pytest.fixture(scope="session")
def database():
    if not _recreate_database():
        pytest.skip("Không kết nối được PostgreSQL kiểm thử")
    from dental_ai.db import connect
    from dental_ai.embeddings import LocalHashEmbedder
    from dental_ai.knowledge import init_db, reindex

    with connect(TEST_DB_URL) as conn:
        init_db(conn)
        reindex(conn, LocalHashEmbedder())
    return TEST_DB_URL


@pytest.fixture
def conn(database):
    from dental_ai.db import connect

    with connect(database) as c:
        yield c
