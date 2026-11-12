CREATE TABLE geofences (
    id              UUID PRIMARY KEY,
    version         BIGINT           NOT NULL,
    name            VARCHAR(100)     NOT NULL,
    kind            VARCHAR(16)      NOT NULL,
    shape           JSONB            NOT NULL,
    speed_limit_kph DOUBLE PRECISION,
    active          BOOLEAN          NOT NULL,
    created_at      TIMESTAMPTZ      NOT NULL,
    updated_at      TIMESTAMPTZ      NOT NULL,
    CONSTRAINT chk_geofences_kind CHECK (kind IN ('DEPOT', 'SERVICE_AREA', 'RESTRICTED'))
);

CREATE TABLE zone_occupancies (
    geofence_id         UUID        NOT NULL REFERENCES geofences (id) ON DELETE CASCADE,
    vehicle_id          UUID        NOT NULL,
    inside              BOOLEAN     NOT NULL,
    last_position_at    TIMESTAMPTZ NOT NULL,
    last_speed_alert_at TIMESTAMPTZ,
    PRIMARY KEY (geofence_id, vehicle_id)
);

CREATE INDEX idx_zone_occupancies_vehicle ON zone_occupancies (vehicle_id);

CREATE TABLE geofence_alerts (
    id              UUID PRIMARY KEY,
    type            VARCHAR(32)      NOT NULL,
    severity        VARCHAR(16)      NOT NULL,
    geofence_id     UUID             NOT NULL,
    geofence_name   VARCHAR(100)     NOT NULL,
    vehicle_id      UUID             NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    speed_kph       DOUBLE PRECISION NOT NULL,
    speed_limit_kph DOUBLE PRECISION,
    occurred_at     TIMESTAMPTZ      NOT NULL,
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID
);

CREATE INDEX idx_geofence_alerts_occurred ON geofence_alerts (occurred_at DESC);
CREATE INDEX idx_geofence_alerts_open ON geofence_alerts (occurred_at) WHERE acknowledged_at IS NULL;
