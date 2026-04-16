"""Conversion simulator — calculates ROI and projected uplift."""

from backend.app.services.llm_provider import complete

SYSTEM_PROMPT = (
    "You are a retail ROI calculator for premium Middle East fashion retail. "
    "Given recommendations and context, calculate projected financial impact "
    "including revenue uplift, cost savings, and ROI ratios. "
    "Be specific with KWD amounts and percentages. "
    "Respond in a concise structured format."
)


async def calculate_roi(context: dict) -> dict:
    user_prompt = (
        f"Recommendations: {context.get('recommendation', 'N/A')}\n"
        f"Forecast: {context.get('forecast', 'N/A')}\n"
        "Calculate projected ROI impact."
    )
    result = await complete(SYSTEM_PROMPT, user_prompt, task_key="roi")
    return {
        "roi": result["text"],
        "provider": result["provider"],
        "mode": result["mode"],
    }
