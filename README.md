# Seraya — Retail Intelligence Co-Pilot

A premium internal AI decision-support platform for Middle East fashion retail teams. Combines live staff chat, gift guidance, scenario simulation, campaign testing, and management briefings — powered by a multi-provider LLM layer with LangGraph pipeline orchestration.

> **This is not a chatbot.** It is an internal decision layer for retail teams — turning customer situations into consistent staff actions, structured recommendations, and executive-ready insight.

---

## Overview

Seraya is a two-tier application: a Next.js 16 frontend (Vercel) and a FastAPI backend (Railway) with a LangGraph planning pipeline, multi-provider LLM abstraction, and Dockerized data layer.

```
Frontend (Vercel)
  → FastAPI Backend (Railway)
    → LangGraph Pipeline
      → LLM Provider Layer (OpenAI / Ollama / LM Studio / Deterministic)
      → Dockerized Data Layer (PostgreSQL + MongoDB + Redis)
      → Custom GPT Actions
```

---

## Core Modules

### Frontend (Next.js)

| Module | Description | Endpoint |
|---|---|---|
| **Staff Chat** | Live AI-powered staff guidance with FAQ injection and 7-part structured decision output | `POST /api/chat` |
| **Scenario Simulator** | Customer intent and campaign reaction testing | `POST /api/simulate` |
| **Gift Advisor** | Occasion-based gift recommendation engine | `POST /api/gift` |
| **Management Brief** | Executive summary generation for retail leadership | `POST /api/management-brief` |
| **Admin** | Edit system instructions, FAQ, scenario templates, runtime settings | `GET/POST /api/config`, `/api/faq` |

### Backend (FastAPI)

| Module | Description | Endpoint |
|---|---|---|
| **System Status** | LLM provider, mode, and database connectivity | `GET /api/system/status` |
| **Internal Copilot** | Planning team questions through LangGraph pipeline | `POST /api/internal-copilot/ask` |
| **Customer Assistant** | Customer-facing queries via Custom GPT | `POST /api/customer-assistant/ask` |
| **Pipeline** | Full LangGraph planning pipeline execution | `POST /api/pipeline/run` |
| **Planning Focus** | This week's planning focus with full analysis | `POST /api/planning/focus` |

### Staff Chat — Decision Panel

Staff Chat uses a two-column layout. The left column is a conventional chat thread. The right column is a **Decision Panel** that parses every assistant response into 7 structured cards:

1. **Recommended Direction** — what to do
2. **Why It Fits** — business rationale
3. **Staff Script** — exact words staff can use
4. **Next Question to Ask** — keeps the conversation going
5. **Upsell / Alternative** — revenue opportunity
6. **Risk to Avoid** — what NOT to do
7. **Business Value** — measurable impact

If the AI model drifts from this format, a server-side normalizer reconstructs the structure with safe fallback content. The UI never breaks.

---

## What Is Live vs Mock

- **Live (requires OpenAI key):** Staff Chat, Scenario Simulator, Gift Advisor, Management Brief — all call OpenAI's Responses API.
- **Fallback behavior:** If the OpenAI call fails, every endpoint returns a structured fallback response so the UI always renders correctly. No blank screens.
- **Admin config/FAQ/scenarios:** In-memory persistence (resets on server restart). This is acceptable for demo and staging. For production, replace with database-backed storage (see Persistence section below).

---

## Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_ORG/deevo-seraya-demo-v1.git
cd deevo-seraya-demo-v1

# 2. Start the data layer
docker compose up -d

# 3. Set up backend
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
# (run from repo root, or adjust PYTHONPATH)

# 4. Set up frontend (in a separate terminal)
cd ..
npm install
cp .env.example .env.local
# Edit .env.local — add your OPENAI_API_KEY
rm -rf .next
npm run dev

# 5. Open in browser
open http://localhost:3000
```

---

## Environment Variables

### Frontend (.env.local)

| Variable | Required | Default | Scope | Description |
|---|---|---|---|---|
| `OPENAI_API_KEY` | **Yes** | — | Server | Your OpenAI API key. Never exposed to the browser. |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` | Server | Model for all AI features. |
| `NEXT_PUBLIC_APP_NAME` | No | `Seraya Retail Intelligence Co-Pilot` | Client | App name visible in browser. |
| `APP_ENV` | No | `development` | Server | Environment label. |

### Backend (backend/.env)

| Variable | Required | Default | Description |
|---|---|---|---|
| `LLM_PROVIDER` | No | `deterministic` | `openai` / `lmstudio` / `ollama` / `deterministic` |
| `OPENAI_API_KEY` | For cloud mode | — | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` | OpenAI model name |
| `LMSTUDIO_BASE_URL` | For LM Studio | `http://localhost:1234/v1` | LM Studio server URL |
| `OLLAMA_BASE_URL` | For Ollama | `http://localhost:11434` | Ollama server URL |
| `POSTGRES_URL` | No | `postgresql://seraya:seraya_local@localhost:5432/seraya` | PostgreSQL connection |
| `MONGO_URL` | No | `mongodb://seraya:seraya_local@localhost:27017` | MongoDB connection |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection |
| `DEEVO_API_KEY` | For production | — | API key for Custom GPT access |

**Security:** `OPENAI_API_KEY` is server-side only in both frontend and backend.

---

## Where to Edit

| What | Runtime (Admin tab) | Source default |
|---|---|---|
| System instruction | Admin → Instructions | `src/data/defaultConfig.ts` |
| FAQ / Knowledge base | Admin → FAQ Editor | `src/data/defaultFaq.ts` |
| Scenario templates | Admin → Scenarios | `src/data/defaultScenarios.ts` |
| Gift rules | Admin → Instructions | `defaultConfig.giftRules` |
| Brief style | Admin → Instructions | `defaultConfig.briefStyle` |
| Model override | Admin → Runtime | `OPENAI_MODEL` env var |

**Persistence note:** Runtime edits via the Admin tab are stored in server-side memory. They persist across requests within the same process but reset when the Vercel function cold-starts or Railway container restarts. For production, replace `src/lib/configStore.ts` with a database-backed implementation — the interface is designed for drop-in replacement.

---

## Architecture

### Frontend (src/)

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              ← Thin controller → chatService
│   │   ├── config/route.ts            ← Config CRUD (direct store access)
│   │   ├── faq/route.ts               ← FAQ CRUD (direct store access)
│   │   ├── gift/route.ts              ← Thin controller → giftService
│   │   ├── management-brief/route.ts  ← Thin controller → briefService
│   │   └── simulate/route.ts          ← Thin controller → simulationService
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/           # UI components (12 total)
├── data/                 # Default config, FAQ, scenarios
├── lib/
│   ├── openai.ts         # Lazy-init OpenAI client singleton
│   ├── configStore.ts    # In-memory config store
│   ├── faqEngine.ts      # Keyword-based FAQ retrieval
│   └── services/         # Business logic (chat, gift, simulation, brief)
└── types/                # TypeScript type definitions
```

### Backend (backend/)

```
backend/
├── app/
│   ├── main.py                        # FastAPI entry point
│   ├── config.py                      # Pydantic settings (env vars)
│   ├── database.py                    # PostgreSQL, MongoDB, Redis connections
│   ├── pipeline.py                    # LangGraph planning pipeline (9 nodes)
│   ├── routes/
│   │   └── api.py                     # API routes (status, copilot, pipeline)
│   └── services/
│       ├── llm_provider.py            # Multi-provider LLM abstraction
│       ├── intent_engine.py           # Intent classification
│       ├── recommendation_engine.py   # Action recommendations
│       ├── offer_engine.py            # Campaign readiness evaluation
│       ├── conversion_simulator.py    # ROI calculation
│       ├── marketing_engine.py        # Marketing action generation
│       ├── internal_copilot.py        # Internal team copilot
│       └── customer_assistant.py      # Customer-facing assistant
├── sql/
│   └── init.sql                       # PostgreSQL schema
├── requirements.txt
└── .env.example
```

### LangGraph Pipeline Flow

```
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
```

### Service Layer Pattern

API routes are thin controllers — they parse the request, call a service, and return the response. All business logic (prompt building, OpenAI calls, output parsing, fallback handling) lives in `src/lib/services/`. This makes future Railway extraction straightforward: move the `services/` and `lib/` directories into a standalone Express/Fastify server with no refactoring of business logic.

### Orphaned Files

`src/components/GPTCompanion.tsx` exists but is not imported by any component. It cannot be deleted due to filesystem mount constraints. It has zero impact on the build or runtime.

---

## GitHub Workflow

```bash
# Initialize repo (if not already done)
git init
git remote add origin https://github.com/YOUR_ORG/deevo-seraya-demo-v1.git

# Verify nothing sensitive is staged
git status
git diff --cached  # check for API keys

# Commit and push
git add -A
git commit -m "Production-ready Seraya Co-Pilot with service layer"
git push -u origin main
```

**Pre-push checklist:**
1. No `.env.local` or secrets in the commit (`git diff --cached` to verify)
2. `npx tsc --noEmit` passes with zero errors
3. `npx eslint src/` passes with zero errors
4. `.env.example` is present with empty `OPENAI_API_KEY=`
5. `README.md` is up to date

---

## Vercel Deployment

1. Push to GitHub (see above)
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Vercel auto-detects Next.js — no build config needed
4. Add environment variable: `OPENAI_API_KEY` = your key
5. Optionally set `OPENAI_MODEL` if you want a different model
6. Deploy — both frontend and API routes run on Vercel's serverless infrastructure
7. Custom domain (optional): add in Vercel dashboard → Settings → Domains

**Build command:** `npm run build` (auto-detected)
**Output directory:** `.next` (auto-detected)

---

## Railway Future Split

The project is structured for backend extraction but does **not** require Railway for the initial deployment. Here is the extraction path when you're ready:

### Current State (Vercel-only)
```
Browser → Vercel (Next.js SSR + API Routes) → OpenAI
```

### Future State (Vercel + Railway)
```
Browser → Vercel (Next.js SSR)
                ↓ fetch()
         Railway (Express/Fastify)
                ↓
              OpenAI
```

### Extraction Steps

1. Create a new Railway project with a `server/` directory
2. Copy `src/lib/services/`, `src/lib/openai.ts`, `src/lib/configStore.ts`, `src/lib/faqEngine.ts`, `src/lib/simulationEngine.ts`, and `src/types/` into the Railway project
3. Create Express/Fastify routes that mirror the current Next.js API routes:
   - `POST /chat` → `handleChat()`
   - `POST /gift` → `handleGift()`
   - `POST /simulate` → `handleSimulation()`
   - `POST /management-brief` → `handleBrief()`
4. Set `RAILWAY_API_BASE_URL` on Vercel
5. Update frontend `fetch()` calls to use `NEXT_PUBLIC_BASE_URL` or `RAILWAY_API_BASE_URL`
6. Replace `configStore.ts` with Redis or PostgreSQL for persistent config
7. Deploy Railway service with the same `OPENAI_API_KEY`

### Railway Config (when ready)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "node dist/server.js",
    "healthcheckPath": "/health"
  }
}
```

---

## Demo Prompts

Use these three prompts to validate the full pipeline:

**Prompt 1 — Eid Gift:**
```
Customer needs an Eid gift for a female recipient, around 150 KWD, elegant but not flashy.
```

**Prompt 2 — Corporate Gift:**
```
Customer is hesitant between watches and accessories for a premium corporate gift in Kuwait.
```

**Prompt 3 — Ramadan Campaign:**
```
What should store staff emphasize in a Ramadan premium accessories campaign?
```

Each should produce a structured response with all 7 decision sections. The Decision Panel on the right side of Staff Chat should render each section as a separate card.

---

## Safety and Limitations

**This demo does not have access to:**
- Live inventory or stock levels
- Real pricing data
- CRM, ERP, or HR systems
- Customer personal data
- Payment or transaction systems

**This demo is not:**
- A public-facing chatbot
- A production enterprise integration
- A fully split Railway backend (that is prep-only)

**What it is:**
A polished, deployment-ready internal decision-support prototype that demonstrates how AI can standardize retail staff guidance, gift recommendation, scenario planning, and management briefing for premium Middle East retail operations.

**In-memory persistence:** Config, FAQ, and scenario changes made via the Admin tab are stored in server memory. They survive across requests within the same process but reset on cold start. This is documented and acceptable for demo/staging. Replace `configStore.ts` with a database for production persistence.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **AI:** OpenAI Responses API (gpt-4.1-mini default)
- **Fonts:** Geist Sans + Geist Mono

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.11+
- **Pipeline:** LangGraph
- **LLM Providers:** OpenAI, Ollama, LM Studio, Deterministic
- **Databases:** PostgreSQL, MongoDB, Redis (via Docker)

---

## Test Commands

```bash
# Start data layer
docker compose up -d

# Start backend (from repo root)
cd backend && pip install -r requirements.txt && cd ..
uvicorn backend.app.main:app --reload --port 8000

# Start frontend (separate terminal)
npm install
npm run dev

# Verify system status
curl http://localhost:8000/api/system/status

# Test internal copilot
curl -X POST http://localhost:8000/api/internal-copilot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What should the planning team focus on this week?"}'

# Test planning focus (full pipeline)
curl -X POST http://localhost:8000/api/planning/focus \
  -H "Content-Type: application/json" \
  -d '{"question": "What should the planning team focus on this week?"}'

# Build frontend
npm run build
```

---

## Build Commands

```bash
npm run dev      # Frontend development server
npm run build    # Frontend production build
npm run start    # Frontend production server
npm run lint     # ESLint check
```

---

## License

Internal demo — Deevo Analytics. Not for public distribution.
