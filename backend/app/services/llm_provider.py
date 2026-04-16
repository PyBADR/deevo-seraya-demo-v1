"""
LLM Provider Abstraction Layer

Supports:
- OpenAI cloud mode
- LM Studio local/private mode
- Ollama local/private mode
- Deterministic demo mode

Never crashes. Always returns provider_mode in responses.
Falls back safely if any provider is unreachable.
"""

from __future__ import annotations

import httpx
from openai import AsyncOpenAI

from app.config import settings

# ── Provider mode labels ─────────────────────────────────────

MODE_CLOUD = "cloud_ai"
MODE_LOCAL = "private_local_ai"
MODE_DEMO = "deterministic_demo"


# ── Deterministic fallbacks ──────────────────────────────────

DETERMINISTIC_RESPONSES: dict[str, str] = {
    "default": (
        "Based on current retail planning data, the team should focus on "
        "inventory rebalancing across top-performing stores, aligning staff "
        "schedules with forecasted foot traffic, and preparing campaign "
        "assets for the upcoming promotional period."
    ),
    "intent": "planning_query",
    "forecast": (
        "Forecasted weekly sales: KWD 42,500 across 12 stores. "
        "Accessories lead at +8% WoW. Footwear flat. Watches trending down 3%."
    ),
    "inventory_risk": (
        "3 SKUs below safety stock at Marina Mall. "
        "Avenues store overstocked on seasonal items by 22%. "
        "Recommend transfer of 45 units from Avenues to Marina."
    ),
    "recommendation": (
        "Transfer 45 units of premium accessories from Avenues to Marina Mall. "
        "Schedule 2 additional staff for weekend peak at 360 Mall. "
        "Launch Ramadan early-bird campaign in Week 2."
    ),
    "roi": (
        "Projected uplift: KWD 6,200/week from inventory transfer. "
        "Staff optimization saves KWD 1,800/week. "
        "Campaign expected ROI: 3.2x on KWD 5,000 spend."
    ),
    "governance": (
        "All recommendations within policy limits. "
        "No discount exceeds 15% threshold. "
        "Transfer volumes within inter-store policy cap."
    ),
}


# ── Client factory ───────────────────────────────────────────


def _get_openai_client() -> AsyncOpenAI | None:
    if not settings.OPENAI_API_KEY:
        return None
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


def _get_lmstudio_client() -> AsyncOpenAI | None:
    return AsyncOpenAI(
        base_url=settings.LMSTUDIO_BASE_URL,
        api_key="lm-studio",
    )


def _get_ollama_client() -> AsyncOpenAI | None:
    return AsyncOpenAI(
        base_url=f"{settings.OLLAMA_BASE_URL}/v1",
        api_key="ollama",
    )


# ── Reachability checks ─────────────────────────────────────


async def check_openai() -> bool:
    if not settings.OPENAI_API_KEY:
        return False
    try:
        client = _get_openai_client()
        if client is None:
            return False
        await client.models.list()
        return True
    except Exception:
        return False


async def check_lmstudio() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as http:
            r = await http.get(f"{settings.LMSTUDIO_BASE_URL}/models")
            return r.status_code == 200
    except Exception:
        return False


async def check_ollama() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as http:
            r = await http.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
            return r.status_code == 200
    except Exception:
        return False


# ── Resolve active provider ─────────────────────────────────


async def resolve_provider() -> tuple[str, str, AsyncOpenAI | None]:
    """Returns (provider_name, mode, client_or_None)."""
    requested = settings.LLM_PROVIDER.lower()

    if requested == "openai":
        client = _get_openai_client()
        if client and await check_openai():
            return "openai", MODE_CLOUD, client
        # fallback
        return "deterministic", MODE_DEMO, None

    if requested == "lmstudio":
        if await check_lmstudio():
            return "lmstudio", MODE_LOCAL, _get_lmstudio_client()
        return "deterministic", MODE_DEMO, None

    if requested == "ollama":
        if await check_ollama():
            return "ollama", MODE_LOCAL, _get_ollama_client()
        return "deterministic", MODE_DEMO, None

    return "deterministic", MODE_DEMO, None


def _model_for_provider(provider: str) -> str:
    if provider == "openai":
        return settings.OPENAI_MODEL
    if provider == "lmstudio":
        return settings.LMSTUDIO_MODEL
    if provider == "ollama":
        return settings.OLLAMA_MODEL
    return ""


# ── Main completion function ─────────────────────────────────


async def complete(
    system_prompt: str,
    user_prompt: str,
    task_key: str = "default",
) -> dict:
    """
    Send a completion request through the active LLM provider.
    Returns {"text": str, "provider": str, "mode": str}.
    """
    provider, mode, client = await resolve_provider()

    if provider == "deterministic" or client is None:
        return {
            "text": DETERMINISTIC_RESPONSES.get(
                task_key, DETERMINISTIC_RESPONSES["default"]
            ),
            "provider": "deterministic",
            "mode": MODE_DEMO,
        }

    model = _model_for_provider(provider)

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        text = response.choices[0].message.content or ""
        return {"text": text, "provider": provider, "mode": mode}
    except Exception:
        return {
            "text": DETERMINISTIC_RESPONSES.get(
                task_key, DETERMINISTIC_RESPONSES["default"]
            ),
            "provider": "deterministic",
            "mode": MODE_DEMO,
        }
