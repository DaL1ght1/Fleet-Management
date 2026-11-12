CREATE TABLE notifications (
    id                   UUID PRIMARY KEY,
    source_event_id      UUID        NOT NULL,
    kind                 VARCHAR(40) NOT NULL,
    severity             VARCHAR(16) NOT NULL,
    staff_audience       BOOLEAN     NOT NULL,
    recipient_account_id UUID,
    params               JSONB       NOT NULL,
    link                 VARCHAR(255),
    created_at           TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_notifications_audience CHECK (staff_audience OR recipient_account_id IS NOT NULL)
);

CREATE INDEX idx_notifications_source ON notifications (source_event_id);
CREATE INDEX idx_notifications_staff ON notifications (created_at DESC) WHERE staff_audience;
CREATE INDEX idx_notifications_recipient ON notifications (recipient_account_id, created_at DESC);

CREATE TABLE notification_reads (
    notification_id UUID        NOT NULL REFERENCES notifications (id) ON DELETE CASCADE,
    account_id      UUID        NOT NULL,
    read_at         TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (notification_id, account_id)
);

CREATE TABLE recipients (
    id                       UUID PRIMARY KEY,
    kind                     VARCHAR(16)  NOT NULL,
    account_id               UUID,
    display_name             VARCHAR(255),
    license_expiry_date      DATE,
    license_reminder_sent_for DATE,
    deleted                  BOOLEAN      NOT NULL,
    last_event_at            TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_recipients_license ON recipients (kind, license_expiry_date) WHERE NOT deleted;

CREATE TABLE known_vehicles (
    id            UUID PRIMARY KEY,
    label         VARCHAR(255),
    last_event_at TIMESTAMPTZ NOT NULL
);
