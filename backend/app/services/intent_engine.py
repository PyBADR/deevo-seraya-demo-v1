"""Intent classification engine — determines what the user is asking about."""

from app.services.llm_provider import complete

SYSTEM_PROMPT = (
    "You are an intent classifier for a retail planning copilot. "
    "Classify the user's question into exactly one of these intents: "
    "planning_query, sales_forecast, inventory_check, staff_scheduling, "
    "campaign_planning, transfer_request, general_question. "
    "Respond with only the intent label, nothing else."
)


async def classify_intent(question: str) -> dict:
    result = await complete(SYSTEM_PROMPT, question, task_key="intent")
    intent = result["text"].strip().lower().replace(" ", "_")
    valid_intents = {
        "planning_query", "sales_forecast", "inventory_check",
        "staff_scheduling", "campaign_planning", "transfer_request",
        "general_question",
    }
    if intent not in valid_intents:
        intent = "planning_query"
    return {
        "intent": intent,
        "provider": result["provider"],
        "mode": result["mode"],
    }
