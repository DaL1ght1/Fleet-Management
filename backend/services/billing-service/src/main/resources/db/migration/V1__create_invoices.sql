CREATE SEQUENCE invoice_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE billed_customers (
    id            UUID PRIMARY KEY,
    account_id    UUID,
    last_event_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_billed_customers_account ON billed_customers (account_id);

CREATE TABLE invoices (
    id                  UUID PRIMARY KEY,
    version             BIGINT         NOT NULL,
    number              VARCHAR(32)    NOT NULL,
    status              VARCHAR(16)    NOT NULL,
    trip_id             UUID           NOT NULL,
    customer_id         UUID,
    vehicle_id          UUID           NOT NULL,
    lines               JSONB          NOT NULL,
    subtotal            NUMERIC(12, 3) NOT NULL,
    tax_rate            NUMERIC(5, 4)  NOT NULL,
    tax_amount          NUMERIC(12, 3) NOT NULL,
    total               NUMERIC(12, 3) NOT NULL,
    issued_on           DATE,
    due_date            DATE,
    paid_on             DATE,
    payment_method      VARCHAR(16),
    void_reason         TEXT,
    overdue_notified_at TIMESTAMPTZ,
    created_at          TIMESTAMPTZ    NOT NULL,
    updated_at          TIMESTAMPTZ    NOT NULL,
    CONSTRAINT uq_invoices_number UNIQUE (number),
    CONSTRAINT uq_invoices_trip UNIQUE (trip_id),
    CONSTRAINT chk_invoices_status CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'VOID'))
);

CREATE INDEX idx_invoices_customer ON invoices (customer_id);
CREATE INDEX idx_invoices_status_due ON invoices (status, due_date);
