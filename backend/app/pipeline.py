"""
LangGraph Pipeline — Full retail planning workflow.

Every question runs through:
  question
  → classify_intent
  → fetch_planning_context
  → forecast_sales
  → check_inventory_risk
  → recommend_transfer_staff_campaign_action
  → calculate_roi
  → apply_governance
  → write_audit
  → return_answer
"""

from __future__ import annotations

from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.database import write_audit_log
from app.services import (
    conversion_simulator,
    intent_engine,
    internal_copilot,
    offer_engine,
    recommendation_engine,
)
from app.services.llm_provider import (
    DETERMINISTIC_RESPONSES,
    MODE_DEMO,
    complete,
)


# ── Pipeline state ───────────────────────────────────────────


class PipelineState(TypedDict, total=False):
    question: str
    intent: str
    planning_context: dict
    forecast: str
    inventory_risk: str
    recommendation: str
    campaign_readiness: str
    roi: str
    governance: str
    audit_id: str
    answer: str
    provider_mode: str


# ── Node functions ───────────────────────────────────────────


async def classify_intent_node(state: PipelineState) -> PipelineState:
    result = await intent_engine.classify_intent(state["question"])
    state["intent"] = result["intent"]
    state["provider_mode"] = result["mode"]
    return state


async def fetch_planning_context_node(state: PipelineState) -> PipelineState:
    state["planning_context"] = {
        "question": state["question"],
        "intent": state.get("intent", "planning_query"),
        "stores": ["Marina Mall", "Avenues", "360 Mall", "The Gate Mall"],
        "categories": ["Accessories", "Watches", "Footwear", "Bags"],
        "period": "current_week",
    }
    return state


async def forecast_sales_node(state: PipelineState) -> PipelineState:
    result = await complete(
        "You are a sales forecasting engine for premium Middle East fashion retail. "
        "Provide a concise weekly sales forecast with category breakdown and trends.",
        f"Question: {state['question']}\nIntent: {state.get('intent', 'planning_query')}\n"
        f"Stores: {state.get('planning_context', {}).get('stores', [])}\n"
        "Generate a weekly sales forecast.",
        task_key="forecast",
    )
    state["forecast"] = result["text"]
    return state


async def check_inventory_risk_node(state: PipelineState) -> PipelineState:
    result = await complete(
        "You are an inventory risk analyzer for premium Middle East fashion retail. "
        "Identify SKUs below safety stock, overstocked items, and recommended transfers.",
        f"Question: {state['question']}\nForecast: {state.get('forecast', 'N/A')}\n"
        "Identify inventory risks and transfer opportunities.",
        task_key="inventory_risk",
    )
    state["inventory_risk"] = result["text"]
    return state


async def recommend_actions_node(state: PipelineState) -> PipelineState:
    context = {
        "question": state["question"],
        "intent": state.get("intent", "planning_query"),
        "forecast": state.get("forecast", ""),
        "inventory_risk": state.get("inventory_risk", ""),
    }
    result = await recommendation_engine.recommend_actions(context)
    state["recommendation"] = result["recommendation"]

    offer_result = await offer_engine.evaluate_offers(context)
    state["campaign_readiness"] = offer_result["campaign_readiness"]
    return state


async def calculate_roi_node(state: PipelineState) -> PipelineState:
    context = {
        "recommendation": state.get("recommendation", ""),
        "forecast": state.get("forecast", ""),
    }
    result = await conversion_simulator.calculate_roi(context)
    state["roi"] = result["roi"]
    return state


async def apply_governance_node(state: PipelineState) -> PipelineState:
    result = await complete(
        "You are a retail governance checker. Verify that all recommendations "
        "comply with company policies: max 15% discount, inter-store transfer caps, "
        "staff scheduling regulations, and campaign budget limits. "
        "Flag any violations.",
        f"Recommendations: {state.get('recommendation', 'N/A')}\n"
        f"ROI projections: {state.get('roi', 'N/A')}\n"
        "Check governance compliance.",
        task_key="governance",
    )
    state["governance"] = result["text"]
    return state


async def write_audit_node(state: PipelineState) -> PipelineState:
    audit_id = write_audit_log(
        action="pipeline_run",
        input_summary=state["question"][:200],
        output_summary=(state.get("recommendation", "") or "")[:200],
        provider_mode=state.get("provider_mode", MODE_DEMO),
    )
    state["audit_id"] = audit_id
    return state


async def return_answer_node(state: PipelineState) -> PipelineState:
    context = {
        "forecast": state.get("forecast", ""),
        "inventory_risk": state.get("inventory_risk", ""),
        "recommendation": state.get("recommendation", ""),
        "roi": state.get("roi", ""),
        "governance": state.get("governance", ""),
    }
    result = await internal_copilot.ask_copilot(state["question"], context)
    state["answer"] = result["answer"]
    state["provider_mode"] = result["mode"]
    return state


# ── Build the graph ──────────────────────────────────────────


def build_pipeline() -> StateGraph:
    graph = StateGraph(PipelineState)

    graph.add_node("classify_intent", classify_intent_node)
    graph.add_node("fetch_planning_context", fetch_planning_context_node)
    graph.add_node("forecast_sales", forecast_sales_node)
    graph.add_node("check_inventory_risk", check_inventory_risk_node)
    graph.add_node("recommend_actions", recommend_actions_node)
    graph.add_node("calculate_roi", calculate_roi_node)
    graph.add_node("apply_governance", apply_governance_node)
    graph.add_node("write_audit", write_audit_node)
    graph.add_node("return_answer", return_answer_node)

    graph.set_entry_point("classify_intent")
    graph.add_edge("classify_intent", "fetch_planning_context")
    graph.add_edge("fetch_planning_context", "forecast_sales")
    graph.add_edge("forecast_sales", "check_inventory_risk")
    graph.add_edge("check_inventory_risk", "recommend_actions")
    graph.add_edge("recommend_actions", "calculate_roi")
    graph.add_edge("calculate_roi", "apply_governance")
    graph.add_edge("apply_governance", "write_audit")
    graph.add_edge("write_audit", "return_answer")
    graph.add_edge("return_answer", END)

    return graph


_compiled_pipeline = None


def get_pipeline():
    global _compiled_pipeline
    if _compiled_pipeline is None:
        _compiled_pipeline = build_pipeline().compile()
    return _compiled_pipeline


async def run_pipeline(question: str) -> dict:
    """Run the full planning pipeline for a question."""
    pipeline = get_pipeline()
    initial_state: PipelineState = {"question": question}
    result = await pipeline.ainvoke(initial_state)
    return {
        "question": result.get("question", question),
        "intent": result.get("intent", ""),
        "forecast": result.get("forecast", ""),
        "inventory_risk": result.get("inventory_risk", ""),
        "recommendation": result.get("recommendation", ""),
        "campaign_readiness": result.get("campaign_readiness", ""),
        "roi": result.get("roi", ""),
        "governance": result.get("governance", ""),
        "audit_id": result.get("audit_id", ""),
        "answer": result.get("answer", ""),
        "provider_mode": result.get("provider_mode", MODE_DEMO),
    }
