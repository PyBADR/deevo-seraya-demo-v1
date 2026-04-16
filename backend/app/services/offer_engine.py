"""Offer engine — evaluates campaign readiness and promotional offers."""

from app.services.llm_provider import complete

SYSTEM_PROMPT = (
    "You are a campaign readiness evaluator for premium Middle East fashion retail. "
    "Assess the current campaign pipeline and promotional readiness. "
    "Consider seasonal events (Ramadan, Eid, National Day), inventory levels, "
    "and staff preparedness. Respond with campaign readiness status and "
    "recommended promotional actions."
)


async def evaluate_offers(context: dict) -> dict:
    user_prompt = (
        f"Question: {context.get('question', '')}\n"
        f"Forecast: {context.get('forecast', 'N/A')}\n"
        f"Inventory: {context.get('inventory_risk', 'N/A')}\n"
        "Evaluate campaign readiness and offer potential."
    )
    result = await complete(SYSTEM_PROMPT, user_prompt, task_key="recommendation")
    return {
        "campaign_readiness": result["text"],
        "provider": result["provider"],
        "mode": result["mode"],
    }
