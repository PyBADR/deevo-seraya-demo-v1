# Seraya — Retail Intelligence Co-Pilot

A premium internal AI decision-support platform for Middle East fashion retail teams. Combines live staff chat, gift guidance, scenario simulation, campaign testing, and management briefings — all powered by OpenAI.

> **This is not a chatbot.** It is an internal decision layer for retail teams — turning customer situations into consistent staff actions, structured recommendations, and executive-ready insight.

---

## Overview

Seraya is built as a unified Next.js application with a clear service-layer architecture. It runs entirely on Vercel today and is structured for future backend extraction to Railway when scaling demands it.

**Current architecture:** Vercel-hosted unified Next.js 16 app (frontend + API routes + OpenAI integration).

**Future architecture:** Vercel frontend + Railway service for AI/business logic + persistent config/data layer.

---

## Core Modules

| Module | Description | Endpoint |
|---|---|---|
| **Staff Chat** | Live AI-powered staff guidance with FAQ injection and 7-part structured decision output | `POST /api/chat` |
| **Scenario Simulator** | Customer intent and campaign reaction testing | `POST /api/simulate` |
| **Gift Advisor** | Occasion-based gift recommendation engine | `POST /api/gift` |
| **Management Brief** | Executive summary generation for retail leadership | `POST /api/management-brief` |
| **Admin** | Edit system instructions, FAQ, scenario templates, runtime settings | `GET/POST /api/config`, `/api/faq` |

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

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local — add your OPENAI_API_KEY

# 4. Clear any stale build cache and start
rm -rf .next
npm run dev

# 5. Open in browser
open http://localhost:3000
```

---

## Environment Variables

| Variable | Required | Default | Scope | Description |
|---|---|---|---|---|
| `OPENAI_API_KEY` | **Yes** | — | Server | Your OpenAI API key. Never exposed to the browser. |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` | Server | Model for all AI features. |
| `NEXT_PUBLIC_APP_NAME` | No | `Seraya Retail Intelligence Co-Pilot` | Client | App name visible in browser. |
| `APP_ENV` | No | `development` | Server | Environment label. |

**Future (Railway split only — not required now):**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Vercel frontend URL |
| `RAILWAY_API_BASE_URL` | Railway backend URL |

**Security:** `OPENAI_API_KEY` is server-side only. It is never prefixed with `NEXT_PUBLIC_` and is never bundled into the client-side JavaScript. All API routes run in Vercel's serverless functions.

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
├── components/
│   ├── AdminPanel.tsx          # Config/FAQ/scenario editors (5 sub-tabs)
│   ├── ChatMessage.tsx         # Chat bubble with avatar + timestamp
│   ├── ConfigEditor.tsx        # Form field components
│   ├── DecisionPanel.tsx       # 7-card structured decision renderer
│   ├── DemoShell.tsx           # Tab navigation shell (5 tabs)
│   ├── Footer.tsx              # Disclaimer footer
│   ├── GiftAdvisor.tsx         # Gift recommendation form + results
│   ├── ManagementBrief.tsx     # Brief generation form + results
│   ├── ScenarioSimulator.tsx   # Simulation form + results
│   ├── SectionCard.tsx         # Reusable card component
│   ├── StaffChat.tsx           # Two-column chat + Decision Panel
│   └── TopBar.tsx              # Header with status indicator
├── data/
│   ├── defaultConfig.ts        # System instruction + rules + tone
│   ├── defaultFaq.ts           # 12 FAQ entries (GCC retail knowledge)
│   ├── defaultScenarios.ts     # 5 scenario templates
│   └── serayaMock.ts           # Legacy mock data (orphaned, harmless)
├── lib/
│   ├── openai.ts               # Lazy-init OpenAI client singleton (Proxy)
│   ├── configStore.ts          # In-memory config/FAQ/scenario store
│   ├── faqEngine.ts            # Keyword-based FAQ retrieval engine
│   ├── simulationEngine.ts     # Prompt builders for simulation/gift/brief
│   ├── decisionEngine.ts       # Utility functions (scoring, labels)
│   └── services/
│       ├── chatService.ts      # Chat business logic + output normalization
│       ├── giftService.ts      # Gift advisor business logic + fallback
│       ├── simulationService.ts # Scenario simulation logic + fallback
│       └── briefService.ts     # Management brief logic + fallback
└── types/
    ├── chat.ts                 # ChatMessage, ChatRequest, StarterPrompt
    ├── config.ts               # AppConfig, FaqItem, ScenarioTemplate
    └── simulation.ts           # Simulation/Gift/Brief request + result types
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

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **AI:** OpenAI Responses API (gpt-4.1-mini default)
- **Fonts:** Geist Sans + Geist Mono

---

## Build Commands

```bash
npm run dev      # Local development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

---

## License

Internal demo — Deevo Analytics. Not for public distribution.
