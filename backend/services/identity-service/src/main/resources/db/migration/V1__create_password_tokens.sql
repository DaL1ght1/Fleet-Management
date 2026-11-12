CREATE TABLE password_tokens (
    id         UUID PRIMARY KEY,
    account_id UUID        NOT NULL,
    purpose    VARCHAR(16) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at    TIMESTAMPTZ,
    CONSTRAINT uq_password_tokens_hash UNIQUE (token_hash),
    CONSTRAINT chk_password_tokens_purpose CHECK (purpose IN ('RESET', 'INVITATION'))
);

CREATE INDEX idx_password_tokens_expires ON password_tokens (expires_at);
