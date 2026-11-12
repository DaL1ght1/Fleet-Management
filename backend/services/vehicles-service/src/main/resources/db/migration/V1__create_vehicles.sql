CREATE TABLE vehicles (
    id                        UUID PRIMARY KEY,
    version                   BIGINT         NOT NULL,
    make                      VARCHAR(100)   NOT NULL,
    model                     VARCHAR(100)   NOT NULL,
    year                      INTEGER        NOT NULL,
    license_plate             VARCHAR(32)    NOT NULL,
    vin                       VARCHAR(17)    NOT NULL,
    color                     VARCHAR(50)    NOT NULL,
    mileage                   BIGINT         NOT NULL,
    fuel_type                 VARCHAR(16)    NOT NULL,
    seating_capacity          INTEGER        NOT NULL,
    daily_rate                NUMERIC(10, 2) NOT NULL,
    gps_enabled               BOOLEAN        NOT NULL,
    status                    VARCHAR(16)    NOT NULL,
    last_maintenance_date     DATE           NOT NULL,
    maintenance_interval_days INTEGER        NOT NULL,
    next_maintenance_date     DATE GENERATED ALWAYS AS (last_maintenance_date + maintenance_interval_days) STORED,
    current_trip_id           UUID,
    created_at                TIMESTAMPTZ    NOT NULL,
    updated_at                TIMESTAMPTZ    NOT NULL,
    CONSTRAINT uq_vehicles_license_plate UNIQUE (license_plate),
    CONSTRAINT uq_vehicles_vin UNIQUE (vin),
    CONSTRAINT chk_vehicles_mileage CHECK (mileage >= 0),
    CONSTRAINT chk_vehicles_seats CHECK (seating_capacity BETWEEN 1 AND 100),
    CONSTRAINT chk_vehicles_rate CHECK (daily_rate >= 0),
    CONSTRAINT chk_vehicles_interval CHECK (maintenance_interval_days > 0),
    CONSTRAINT chk_vehicles_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    CONSTRAINT chk_vehicles_fuel CHECK (fuel_type IN ('GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'))
);

CREATE INDEX idx_vehicles_status ON vehicles (status);
CREATE INDEX idx_vehicles_next_maintenance ON vehicles (next_maintenance_date);
