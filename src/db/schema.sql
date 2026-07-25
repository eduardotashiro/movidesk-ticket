-- Gerado via DBeaver para garantir fidelidade com a produção
CREATE TABLE IF NOT EXISTS ticket_slack_metadata (
    ticket_id INTEGER NOT NULL,
    slack_thread_ts VARCHAR(50),
    slack_channel_id VARCHAR(40),
    user_id VARCHAR,
    protocol VARCHAR(30),
    threadcontext VARCHAR(200),
    webhook_24h_sent BOOLEAN DEFAULT false,
    webhook_resolve_sent BOOLEAN DEFAULT false NOT NULL,
    original_message_ts VARCHAR(30),
    CONSTRAINT ticket_slack_metadata_pkey PRIMARY KEY (ticket_id)
);

-- 2. Tabela de métricas globais
CREATE TABLE IF NOT EXISTS contagem_tickets_global (
    id SERIAL PRIMARY KEY,
    total_tickets INTEGER DEFAULT 0
);

-- 3. Tabela de controle de duplicidade para webhooks dedicados/urgentes
CREATE TABLE IF NOT EXISTS webhook_duplication_check_only_support (
    webhook_key TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT webhook_duplication_check_only_support_pkey PRIMARY KEY (webhook_key)
);

-- Necessário para o contador de tickets funcionar na primeira execução
INSERT INTO contagem_tickets_global (id, total_tickets) 
VALUES (1, 0) 
ON CONFLICT (id) DO NOTHING;src/db/schema.sql