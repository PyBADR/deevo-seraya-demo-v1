"""Customer assistant — handles customer-facing queries via Custom GPT."""

from app.services.llm_provider import complete

SYSTEM_PROMPT = (
    "You are Seraya, a premium retail assistant for Alyasra Fashion stores "
    "in the Middle East. Help customers with product recommendations, "
    "gift advice, store information, and styling guidance. "
    "Maintain a warm, professional tone appropriate for premium fashion retail. "
    "Consider GCC cultural context and seasonal events."
)


async def ask_assistant(question: str) -> dict:
    result = await complete(SYSTEM_PROMPT, question, task_key="default")
    return {
        "answer": result["text"],
        "provider": result["provider"],
        "mode": result["mode"],
    }
