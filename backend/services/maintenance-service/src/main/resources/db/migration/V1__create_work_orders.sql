CREATE TABLE maintained_vehicles (
    id                    UUID PRIMARY KEY,
    license_plate         VARCHAR(32),
    next_maintenance_date DATE,
    deleted               BOOLEAN     NOT NULL,
    last_event_at         TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_maintained_vehicles_due ON maintained_vehicles (next_maintenance_date) WHERE deleted = false;

CREATE TABLE work_orders (
    id                   UUID PRIMARY KEY,
    version              BIGINT        NOT NULL,
    vehicle_id           UUID          NOT NULL,
    kind                 VARCHAR(16)   NOT NULL,
    priority             VARCHAR(16)   NOT NULL,
    status               VARCHAR(16)   NOT NULL,
    title                VARCHAR(120)  NOT NULL,
    description          TEXT,
    vendor               VARCHAR(120),
    scheduled_for        DATE          NOT NULL,
    auto_generated       BOOLEAN       NOT NULL,
    started_at           TIMESTAMPTZ,
    completed_at         TIMESTAMPTZ,
    odometer_km          BIGINT,
    parts_cost           NUMERIC(10, 2),
    labor_cost           NUMERIC(10, 2),
    resolution_notes     TEXT,
    cancellation_reason  TEXT,
    overdue_notified_at  TIMESTAMPTZ,
    created_at           TIMESTAMPTZ   NOT NULL,
    updated_at           TIMESTAMPTZ   NOT NULL,
    CONSTRAINT chk_work_orders_kind CHECK (kind IN ('PREVENTIVE', 'REPAIR', 'INSPECTION')),
    CONSTRAINT chk_work_orders_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_work_orders_status CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_work_orders_vehicle ON work_orders (vehicle_id);
CREATE INDEX idx_work_orders_status_date ON work_orders (status, scheduled_for);
