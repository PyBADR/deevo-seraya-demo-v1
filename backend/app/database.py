"""Database connections — PostgreSQL, MongoDB, Redis.

All connections are optional. The app runs in degraded mode if databases
are unavailable, using in-memory fallbacks.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import psycopg2
import pymongo
import redis as redis_lib

from app.config import settings

# ── Connection helpers ───────────────────────────────────────


def get_postgres():
    if not settings.DATABASE_URL:
        return None
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        return conn
    except Exception:
        return None


def get_mongo():
    if not settings.MONGODB_URL:
        return None
    try:
        client = pymongo.MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        return client
    except Exception:
        return None


def get_redis():
    try:
        r = redis_lib.from_url(settings.REDIS_URL, socket_timeout=3)
        r.ping()
        return r
    except Exception:
        return None


# ── Health checks ────────────────────────────────────────────


def check_postgres() -> bool:
    conn = get_postgres()
    if conn:
        conn.close()
        return True
    return False


def check_mongo() -> bool:
    client = get_mongo()
    if client:
        client.close()
        return True
    return False


def check_redis() -> bool:
    r = get_redis()
    if r:
        r.close()
        return True
    return False


# ── Audit log ────────────────────────────────────────────────


def write_audit_log(
    action: str,
    input_summary: str,
    output_summary: str,
    provider_mode: str,
) -> str:
    audit_id = str(uuid.uuid4())
    conn = get_postgres()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO audit_logs (audit_id, action, input_summary, output_summary, provider_mode) "
                "VALUES (%s, %s, %s, %s, %s)",
                (audit_id, action, input_summary, output_summary, provider_mode),
            )
            cur.close()
            conn.close()
        except Exception:
            pass
    return audit_id


# ── Session store (MongoDB) ─────────────────────────────────


def save_session(session_id: str, messages: list[dict]) -> None:
    client = get_mongo()
    if client:
        try:
            db = client["seraya"]
            db.sessions.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "messages": messages,
                        "updated_at": datetime.now(timezone.utc),
                    },
                    "$setOnInsert": {"created_at": datetime.now(timezone.utc)},
                },
                upsert=True,
            )
            client.close()
        except Exception:
            pass


def load_session(session_id: str) -> list[dict] | None:
    client = get_mongo()
    if client:
        try:
            db = client["seraya"]
            doc = db.sessions.find_one({"session_id": session_id})
            client.close()
            if doc:
                return doc.get("messages", [])
        except Exception:
            pass
    return None


# ── Cache (Redis) ────────────────────────────────────────────


def cache_set(key: str, value: str, ttl: int = 300) -> None:
    r = get_redis()
    if r:
        try:
            r.setex(key, ttl, value)
            r.close()
        except Exception:
            pass


def cache_get(key: str) -> str | None:
    r = get_redis()
    if r:
        try:
            val = r.get(key)
            r.close()
            if val:
                return val.decode()
        except Exception:
            pass
    return None
