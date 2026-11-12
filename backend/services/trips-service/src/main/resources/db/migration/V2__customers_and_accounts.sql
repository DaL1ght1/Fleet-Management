ALTER TABLE trips ADD COLUMN customer_id UUID;

CREATE INDEX idx_trips_customer ON trips (customer_id);

ALTER TABLE fleet_resources ADD COLUMN account_id UUID;

CREATE INDEX idx_fleet_resources_account ON fleet_resources (account_id);

CREATE TABLE known_customers (
    id            UUID PRIMARY KEY,
    account_id    UUID,
    deleted       BOOLEAN     NOT NULL,
    last_event_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_known_customers_account ON known_customers (account_id);
