# Local & Private AI Setup

Run the Seraya Co-Pilot backend with local LLM providers for data privacy, or use deterministic demo mode without any AI provider.

---

## Docker Data Layer

Start the local database stack:

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** (port 5432) — audit logs, planning outputs, forecast runs
- **MongoDB** (port 27017) — chatbot sessions, store notes
- **Redis** (port 6379) — cache and session memory

Verify:
```bash
docker compose ps
```

Stop:
```bash
docker compose down
```

Reset all data:
```bash
docker compose down -v
```

---

## LLM Provider Options

Set `LLM_PROVIDER` in `backend/.env` to control which AI backend is used.

### Deterministic Demo Mode (default)

```env
LLM_PROVIDER=deterministic
```

No AI provider needed. Returns consistent, pre-built responses for all pipeline stages. Use this for demos, testing, and CI.

### OpenAI Cloud Mode

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

Sends prompts to OpenAI's API. Requires an active API key.

**Data that leaves your network:** User prompts, planning context sent to OpenAI servers.
**Data that stays local:** Audit logs, session history, cached results (all in Docker databases).

### Ollama (Local/Private)

Install Ollama:
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2
ollama serve
```

Configure:
```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**All data stays local.** No external API calls.

### LM Studio (Local/Private)

1. Download LM Studio from https://lmstudio.ai
2. Load a model (e.g., Llama 3.2, Mistral, Phi-3)
3. Start the local server (default port 1234)

Configure:
```env
LLM_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=local-model
```

**All data stays local.** No external API calls.

---

## Fallback Behavior

If the configured provider is unreachable, the system falls back to deterministic mode automatically. The chatbot never crashes — `provider_mode` in every response indicates which mode was actually used:

- `cloud_ai` — OpenAI responded
- `private_local_ai` — Ollama or LM Studio responded
- `deterministic_demo` — pre-built responses used

---

## Switching Providers

1. Edit `backend/.env` and change `LLM_PROVIDER`
2. Restart the backend: `uvicorn backend.app.main:app --reload`
3. Check status: `curl http://localhost:8000/api/system/status`

No frontend changes needed. The provider switch is transparent.

---

## Custom GPT → Railway Backend

For Custom GPT integration, the backend runs on Railway:

1. Deploy the `backend/` directory to Railway
2. Set environment variables in Railway dashboard (same as `backend/.env.example`)
3. Get your Railway URL: `https://YOUR-APP.up.railway.app`
4. In Custom GPT Actions, import `docs/openapi/custom-gpt-actions.yaml`
5. Replace `YOUR-RAILWAY-BACKEND` with your actual Railway URL
6. Set the `X-DEEVO-API-KEY` header in Custom GPT authentication

Protected endpoints (`/api/customer-assistant/ask`, `/api/internal-copilot/ask`, `/api/pipeline/run`, `/api/planning/focus`) require the `X-DEEVO-API-KEY` header.

The `/api/system/status` endpoint is public — no API key needed.

---

## Data Locality Summary

| Data | Deterministic | Ollama/LM Studio | OpenAI Cloud |
|---|---|---|---|
| User prompts | Local only | Local only | Sent to OpenAI |
| Planning context | Local only | Local only | Sent to OpenAI |
| Audit logs | PostgreSQL (local) | PostgreSQL (local) | PostgreSQL (local) |
| Session history | MongoDB (local) | MongoDB (local) | MongoDB (local) |
| Cache | Redis (local) | Redis (local) | Redis (local) |
| AI responses | Pre-built | Generated locally | From OpenAI |

---

## When to Use Each Mode

| Mode | Use case |
|---|---|
| `deterministic` | Demos, testing, CI/CD, no-AI environments |
| `ollama` | Privacy-sensitive deployments, air-gapped networks |
| `lmstudio` | Development with local models, experimenting with different models |
| `openai` | Production with best quality, when data sharing with OpenAI is acceptable |
