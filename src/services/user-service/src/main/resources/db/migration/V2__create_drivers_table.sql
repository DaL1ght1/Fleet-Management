-- Create drivers table
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    license_number VARCHAR(50) UNIQUE,
    license_expiry_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    date_of_birth DATE,
    hire_date DATE DEFAULT CURRENT_DATE,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    current_trip_id UUID,
    rating NUMERIC(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_driver_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ON_LEAVE'))
);

-- Create indexes for better performance
CREATE INDEX idx_drivers_email ON drivers(email);
CREATE INDEX idx_drivers_license ON drivers(license_number);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_current_trip ON drivers(current_trip_id);
CREATE INDEX idx_drivers_name ON drivers(first_name, last_name);

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drivers_updated_at 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Rename existing customer table if needed (optional, only if current table is named 'customer')
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer' AND table_schema = 'public') THEN
        ALTER TABLE customer RENAME TO customers;
        
        -- Create trigger for customers table as well
        CREATE TRIGGER update_customers_updated_at 
            BEFORE UPDATE ON customers 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;