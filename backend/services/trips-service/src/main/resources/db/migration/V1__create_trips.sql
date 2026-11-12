CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE trips (
    id                         UUID PRIMARY KEY,
    version                    BIGINT         NOT NULL,
    type                       VARCHAR(32)    NOT NULL,
    status                     VARCHAR(32)    NOT NULL,
    vehicle_id                 UUID           NOT NULL,
    driver_id                  UUID,
    start_location             JSONB          NOT NULL,
    end_location               JSONB          NOT NULL,
    waypoints                  JSONB          NOT NULL DEFAULT '[]'::jsonb,
    scheduled_start            TIMESTAMPTZ    NOT NULL,
    scheduled_end              TIMESTAMPTZ    NOT NULL,
    started_at                 TIMESTAMPTZ,
    completed_at               TIMESTAMPTZ,
    estimated_duration_minutes INTEGER,
    distance_km                NUMERIC(10, 2),
    base_rate                  NUMERIC(10, 2),
    fuel_cost                  NUMERIC(10, 2),
    additional_fees            NUMERIC(10, 2),
    notes                      TEXT,
    customer_notes             TEXT,
    internal_notes             TEXT,
    cancellation_reason        TEXT,
    created_at                 TIMESTAMPTZ    NOT NULL,
    updated_at                 TIMESTAMPTZ    NOT NULL,
    CONSTRAINT chk_trips_schedule CHECK (scheduled_end > scheduled_start),
    CONSTRAINT chk_trips_type CHECK (type IN ('RENTAL', 'MAINTENANCE', 'RELOCATION', 'EMERGENCY')),
    CONSTRAINT chk_trips_status CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT excl_trips_vehicle_overlap EXCLUDE USING gist (
        vehicle_id WITH =,
        tstzrange(scheduled_start, scheduled_end) WITH &&
    ) WHERE (status IN ('SCHEDULED', 'IN_PROGRESS')),
    CONSTRAINT excl_trips_driver_overlap EXCLUDE USING gist (
        driver_id WITH =,
        tstzrange(scheduled_start, scheduled_end) WITH &&
    ) WHERE (status IN ('SCHEDULED', 'IN_PROGRESS') AND driver_id IS NOT NULL)
);

CREATE INDEX idx_trips_vehicle ON trips (vehicle_id);
CREATE INDEX idx_trips_driver ON trips (driver_id);
CREATE INDEX idx_trips_status ON trips (status);
CREATE INDEX idx_trips_scheduled_start ON trips (scheduled_start DESC);

CREATE TABLE fleet_resources (
    id            UUID PRIMARY KEY,
    kind          VARCHAR(16)  NOT NULL,
    display_name  VARCHAR(255),
    status        VARCHAR(32),
    assignable    BOOLEAN      NOT NULL,
    last_event_at TIMESTAMPTZ  NOT NULL,
    CONSTRAINT chk_fleet_resources_kind CHECK (kind IN ('VEHICLE', 'DRIVER'))
);
