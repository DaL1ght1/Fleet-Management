CREATE TABLE payroll_drivers (
    id             UUID PRIMARY KEY,
    full_name      VARCHAR(255),
    hire_date      DATE,
    monthly_salary NUMERIC(12, 3),
    deleted        BOOLEAN     NOT NULL,
    payroll_cursor DATE        NOT NULL,
    last_event_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE expenses (
    id             UUID PRIMARY KEY,
    version        BIGINT         NOT NULL,
    kind           VARCHAR(16)    NOT NULL,
    status         VARCHAR(16)    NOT NULL,
    source_id      UUID           NOT NULL,
    vehicle_id     UUID,
    driver_id      UUID,
    description    VARCHAR(255),
    amount         NUMERIC(12, 3) NOT NULL,
    due_date       DATE           NOT NULL,
    paid_on        DATE,
    payment_method VARCHAR(16),
    created_at     TIMESTAMPTZ    NOT NULL,
    updated_at     TIMESTAMPTZ    NOT NULL,
    CONSTRAINT uq_expenses_source UNIQUE (kind, source_id, due_date),
    CONSTRAINT chk_expenses_kind CHECK (kind IN ('MAINTENANCE', 'SALARY')),
    CONSTRAINT chk_expenses_status CHECK (status IN ('UNPAID', 'PAID'))
);

CREATE INDEX idx_expenses_status_due ON expenses (status, due_date);
