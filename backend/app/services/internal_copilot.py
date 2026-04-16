"""Internal copilot — processes internal team planning questions through the full pipeline."""

from app.services.llm_provider import complete

SYSTEM_PROMPT = (
    "You are Seraya, an internal retail planning copilot for Alyasra Fashion retail "
    "teams in the Middle East. You help planning teams with weekly focus areas, "
    "inventory decisions, staff scheduling, and campaign planning. "
    "Always provide structured, actionable guidance covering: sales forecast, "
    "inventory risk, transfer actions, workforce gaps, campaign readiness, "
    "and ROI impact. Be specific and data-driven."
)


async def ask_copilot(question: str, context: dict | None = None) -> dict:
    ctx = context or {}
    user_prompt = (
        f"Question: {question}\n"
        f"Forecast: {ctx.get('forecast', 'N/A')}\n"
        f"Inventory risk: {ctx.get('inventory_risk', 'N/A')}\n"
        f"Recommendations: {ctx.get('recommendation', 'N/A')}\n"
        f"ROI: {ctx.get('roi', 'N/A')}\n"
        f"Governance: {ctx.get('governance', 'N/A')}\n"
        "Provide a comprehensive planning response."
    )
    result = await complete(SYSTEM_PROMPT, user_prompt, task_key="default")
    return {
        "answer": result["text"],
        "provider": result["provider"],
        "mode": result["mode"],
    }
