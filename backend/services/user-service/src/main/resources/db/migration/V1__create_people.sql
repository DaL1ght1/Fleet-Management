CREATE TABLE customers (
    id           UUID PRIMARY KEY,
    version      BIGINT       NOT NULL,
    first_name   VARCHAR(60)  NOT NULL,
    last_name    VARCHAR(60)  NOT NULL,
    email        VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at   TIMESTAMPTZ  NOT NULL,
    updated_at   TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_customers_email UNIQUE (email)
);

CREATE TABLE drivers (
    id                      UUID PRIMARY KEY,
    version                 BIGINT       NOT NULL,
    account_id              UUID,
    first_name              VARCHAR(60)  NOT NULL,
    last_name               VARCHAR(60)  NOT NULL,
    email                   VARCHAR(255) NOT NULL,
    phone_number            VARCHAR(20)  NOT NULL,
    license_number          VARCHAR(60)  NOT NULL,
    license_expiry_date     DATE         NOT NULL,
    status                  VARCHAR(16)  NOT NULL,
    date_of_birth           DATE,
    hire_date               DATE         NOT NULL,
    emergency_contact_name  VARCHAR(60),
    emergency_contact_phone VARCHAR(20),
    current_trip_id         UUID,
    rating_total            INTEGER      NOT NULL DEFAULT 0,
    rating_count            INTEGER      NOT NULL DEFAULT 0,
    completed_trips         INTEGER      NOT NULL DEFAULT 0,
    created_at              TIMESTAMPTZ  NOT NULL,
    updated_at              TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uq_drivers_email UNIQUE (email),
    CONSTRAINT uq_drivers_license UNIQUE (license_number),
    CONSTRAINT uq_drivers_account UNIQUE (account_id),
    CONSTRAINT chk_drivers_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE')),
    CONSTRAINT chk_drivers_ratings CHECK (rating_count >= 0 AND rating_total >= 0)
);

CREATE INDEX idx_drivers_status ON drivers (status);
CREATE INDEX idx_drivers_license_expiry ON drivers (license_expiry_date);
