"""Kết nối PostgreSQL + pgvector."""

from contextlib import contextmanager
from typing import Iterator

import psycopg
from pgvector.psycopg import register_vector
from psycopg.rows import dict_row

from .config import get_settings


@contextmanager
def connect(database_url: str | None = None) -> Iterator[psycopg.Connection]:
    conn = psycopg.connect(database_url or get_settings().database_url, row_factory=dict_row)
    try:
        register_vector(conn)
    except psycopg.ProgrammingError:
        pass  # extension vector chưa được tạo (trước init-db)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def get_setting(conn: psycopg.Connection, key: str) -> str | None:
    row = conn.execute("SELECT value FROM app_settings WHERE key = %s", (key,)).fetchone()
    return row["value"] if row else None


def set_setting(conn: psycopg.Connection, key: str, value: str) -> None:
    conn.execute(
        """INSERT INTO app_settings(key, value) VALUES (%s, %s)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()""",
        (key, value),
    )
