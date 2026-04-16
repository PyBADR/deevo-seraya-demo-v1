-- Seraya Co-Pilot — PostgreSQL schema
-- Audit logs, planning outputs, forecast runs

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    audit_id UUID DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    actor TEXT DEFAULT 'system',
    input_summary TEXT,
    output_summary TEXT,
    provider_mode TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS planning_outputs (
    id SERIAL PRIMARY KEY,
    run_id UUID DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    intent TEXT,
    forecast JSONB,
    inventory_risk JSONB,
    recommendation JSONB,
    roi JSONB,
    governance JSONB,
    audit_id UUID,
    provider_mode TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forecast_runs (
    id SERIAL PRIMARY KEY,
    run_id UUID DEFAULT gen_random_uuid(),
    store_id TEXT,
    category TEXT,
    period TEXT,
    forecast_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
