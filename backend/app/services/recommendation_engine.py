"""Recommendation engine — generates actionable retail planning recommendations."""

from backend.app.services.llm_provider import complete

SYSTEM_PROMPT = (
    "You are a retail planning advisor for premium Middle East fashion retail. "
    "Given the planning context, generate specific actionable recommendations "
    "covering: inventory transfers, staff scheduling adjustments, and campaign "
    "actions. Be specific with store names, quantities, and timelines. "
    "Respond in a concise structured format."
)


async def recommend_actions(context: dict) -> dict:
    user_prompt = (
        f"Intent: {context.get('intent', 'planning_query')}\n"
        f"Question: {context.get('question', '')}\n"
        f"Forecast: {context.get('forecast', 'N/A')}\n"
        f"Inventory risk: {context.get('inventory_risk', 'N/A')}\n"
        "Provide transfer, staff, and campaign recommendations."
    )
    result = await complete(SYSTEM_PROMPT, user_prompt, task_key="recommendation")
    return {
        "recommendation": result["text"],
        "provider": result["provider"],
        "mode": result["mode"],
    }
