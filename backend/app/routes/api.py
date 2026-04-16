"""FastAPI routes for Seraya Co-Pilot backend."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.database import check_mongo, check_postgres, check_redis
from app.pipeline import run_pipeline
from app.services.customer_assistant import ask_assistant
from app.services.llm_provider import (
    check_lmstudio,
    check_ollama,
    check_openai,
    resolve_provider,
)

router = APIRouter(prefix="/api")


# ── Auth dependency ──────────────────────────────────────────


async def verify_api_key(x_deevo_api_key: str | None = Header(None)):
    if settings.DEEVO_API_KEY and x_deevo_api_key != settings.DEEVO_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


# ── Request/Response models ──────────────────────────────────


class AskRequest(BaseModel):
    question: str
    session_id: str | None = None
    role: str | None = None
    context: dict | None = None


class AskResponse(BaseModel):
    answer: str
    provider_mode: str


class PipelineResponse(BaseModel):
    question: str
    intent: str
    forecast: str
    inventory_risk: str
    recommendation: str
    campaign_readiness: str
    roi: str
    governance: str
    audit_id: str
    answer: str
    provider_mode: str


# ── System status ────────────────────────────────────────────


@router.get("/system/status")
async def system_status():
    provider, mode, _ = await resolve_provider()
    openai_ok = await check_openai()
    lmstudio_ok = await check_lmstudio()
    ollama_ok = await check_ollama()

    return {
        "llm_provider": provider,
        "mode": mode,
        "openai_configured": openai_ok,
        "lmstudio_reachable": lmstudio_ok,
        "ollama_reachable": ollama_ok,
        "database_status": {
            "postgres": check_postgres(),
            "mongo": check_mongo(),
            "redis": check_redis(),
        },
    }


# ── Customer assistant ───────────────────────────────────────


@router.post("/customer-assistant/ask", response_model=AskResponse, dependencies=[Depends(verify_api_key)])
async def customer_assistant_ask(req: AskRequest):
    result = await ask_assistant(req.question)
    return AskResponse(answer=result["answer"], provider_mode=result["mode"])


# ── Internal copilot ─────────────────────────────────────────


@router.post("/internal-copilot/ask", response_model=PipelineResponse, dependencies=[Depends(verify_api_key)])
async def internal_copilot_ask(req: AskRequest):
    result = await run_pipeline(req.question)
    return PipelineResponse(**result)


# ── Full pipeline ────────────────────────────────────────────


@router.post("/pipeline/run", response_model=PipelineResponse, dependencies=[Depends(verify_api_key)])
async def pipeline_run(req: AskRequest):
    result = await run_pipeline(req.question)
    return PipelineResponse(**result)


# ── Planning focus ───────────────────────────────────────────


@router.post("/planning/focus", response_model=PipelineResponse, dependencies=[Depends(verify_api_key)])
async def planning_focus(req: AskRequest):
    question = req.question or "What should the planning team focus on this week?"
    result = await run_pipeline(question)
    return PipelineResponse(**result)
