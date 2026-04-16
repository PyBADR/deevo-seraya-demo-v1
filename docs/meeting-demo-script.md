# Alyasra Retail Planning Copilot — 3-Minute Demo Script

---

## Minute 0–1: The Problem

> "Alyasra manages 12+ fashion retail stores across Kuwait. Every week, the planning team manually compiles sales forecasts, checks inventory across stores, decides on stock transfers, reviews staffing levels, and evaluates campaign readiness — across spreadsheets, emails, and meetings."
>
> "This takes hours. Decisions are inconsistent. Insights arrive too late to act on."
>
> "We built a planning copilot that does this in seconds."

---

## Minute 1–2: The Product

> "This is the Seraya Retail Planning Copilot. It is not a chatbot. It is an operating layer for retail planning decisions."

Show the system status:

```
GET /api/system/status
```

> "The backend runs a LangGraph pipeline with 9 stages: intent classification, planning context retrieval, sales forecasting, inventory risk analysis, recommendation generation, ROI calculation, governance compliance, audit logging, and answer synthesis."
>
> "It supports four LLM modes: OpenAI cloud, Ollama local, LM Studio local, or deterministic demo — so it works in any environment, including air-gapped."

---

## Minute 2–3: The Proof

> "Let me ask the copilot one question."

Ask:

```
POST /api/internal-copilot/ask

{
  "question": "What should the planning team focus on this week?",
  "role": "executive",
  "context": {
    "country": "Kuwait",
    "planning_period": "next_week"
  }
}
```

> "In one response, I get:"

| Field | What it shows |
|---|---|
| **Sales Forecast** | KWD 42,500 across 12 stores. Accessories +8% WoW. Watches -3%. |
| **Inventory Risk** | 3 SKUs below safety stock at Marina Mall. Avenues overstocked 22%. |
| **Transfer Action** | Move 45 units from Avenues to Marina Mall. |
| **Workforce Gap** | Schedule 2 additional staff for weekend peak at 360 Mall. |
| **Campaign Readiness** | Launch Ramadan early-bird campaign in Week 2. |
| **ROI Impact** | KWD 6,200/week transfer uplift. KWD 1,800/week staff savings. Campaign ROI 3.2x. |
| **Governance** | All actions within policy limits. No discount exceeds 15%. |
| **Audit ID** | Every decision is logged with a unique audit trail ID. |

> "Every answer is audited. Every recommendation is governance-checked. Every insight is structured and actionable."

---

## Closing

> "This is not a chatbot. It is an operating layer for retail planning decisions."
>
> "It connects to your existing systems. It runs locally or in the cloud. It is ready for Custom GPT integration."
>
> "Next step: deploy to Railway, connect the Custom GPT, and put it in front of the planning team."
