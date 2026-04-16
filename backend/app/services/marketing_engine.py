"""Marketing engine — generates campaign briefs and marketing actions."""

from app.services.llm_provider import complete

SYSTEM_PROMPT = (
    "You are a marketing strategist for premium Middle East fashion retail. "
    "Generate campaign briefs, promotional calendar suggestions, and "
    "marketing actions aligned with seasonal events and inventory positions. "
    "Consider GCC cultural context and premium brand positioning."
)


async def generate_marketing_actions(context: dict) -> dict:
    user_prompt = (
        f"Question: {context.get('question', '')}\n"
        f"Recommendations: {context.get('recommendation', 'N/A')}\n"
        f"Campaign readiness: {context.get('campaign_readiness', 'N/A')}\n"
        "Suggest marketing actions."
    )
    result = await complete(SYSTEM_PROMPT, user_prompt, task_key="recommendation")
    return {
        "marketing_actions": result["text"],
        "provider": result["provider"],
        "mode": result["mode"],
    }
