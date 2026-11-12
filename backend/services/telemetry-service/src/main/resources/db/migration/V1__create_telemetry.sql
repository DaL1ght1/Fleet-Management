CREATE TABLE known_vehicles (
    id            UUID PRIMARY KEY,
    license_plate VARCHAR(32),
    deleted       BOOLEAN     NOT NULL,
    last_event_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE devices (
    id           UUID PRIMARY KEY,
    vehicle_id   UUID         NOT NULL,
    label        VARCHAR(100) NOT NULL,
    key_hash     VARCHAR(64)  NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL,
    last_seen_at TIMESTAMPTZ,
    revoked_at   TIMESTAMPTZ,
    CONSTRAINT uq_devices_key_hash UNIQUE (key_hash)
);

CREATE INDEX idx_devices_vehicle ON devices (vehicle_id);

CREATE TABLE positions (
    id                 UUID PRIMARY KEY,
    vehicle_id         UUID             NOT NULL,
    device_id          UUID             NOT NULL,
    recorded_at        TIMESTAMPTZ      NOT NULL,
    received_at        TIMESTAMPTZ      NOT NULL,
    latitude           DOUBLE PRECISION NOT NULL,
    longitude          DOUBLE PRECISION NOT NULL,
    speed_kph          DOUBLE PRECISION NOT NULL,
    heading_degrees    DOUBLE PRECISION,
    odometer_km        DOUBLE PRECISION,
    fuel_level_percent DOUBLE PRECISION,
    ignition_on        BOOLEAN
);

CREATE INDEX idx_positions_vehicle_time ON positions (vehicle_id, recorded_at);
CREATE INDEX idx_positions_recorded_at ON positions (recorded_at);

CREATE TABLE latest_positions (
    vehicle_id         UUID PRIMARY KEY,
    recorded_at        TIMESTAMPTZ      NOT NULL,
    latitude           DOUBLE PRECISION NOT NULL,
    longitude          DOUBLE PRECISION NOT NULL,
    speed_kph          DOUBLE PRECISION NOT NULL,
    heading_degrees    DOUBLE PRECISION,
    odometer_km        DOUBLE PRECISION,
    fuel_level_percent DOUBLE PRECISION,
    ignition_on        BOOLEAN
);
