-- Migration V3: Update Driver entity to inherit from User (Customer)
-- This migration handles the inheritance relationship changes

-- 1. Remove license_number from customers table since it's now only in drivers
ALTER TABLE customers DROP COLUMN IF EXISTS license_number;

-- 2. Ensure drivers table has the correct structure for inheritance
-- Since we're using TABLE_PER_CLASS inheritance strategy, each table maintains its own columns
-- But we need to make sure phone column in drivers is properly aligned with phoneNumber in customers

-- Rename phone to phone_number in drivers table to match the parent class
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'drivers' AND column_name = 'phone' AND table_schema = 'public') THEN
        ALTER TABLE drivers RENAME COLUMN phone TO phone_number;
    END IF;
END $$;

-- 3. Add any missing constraints that should be consistent with parent table
-- Ensure created_at and updated_at columns have correct names and constraints
DO $$
BEGIN
    -- Check if we need to rename created_at column
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'drivers' AND column_name = 'created_at' AND table_schema = 'public') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'drivers' AND column_name = 'creation_date' AND table_schema = 'public') THEN
        ALTER TABLE drivers RENAME COLUMN created_at TO creation_date;
    END IF;
    
    -- Check if we need to rename updated_at column
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'drivers' AND column_name = 'updated_at' AND table_schema = 'public') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'drivers' AND column_name = 'last_modified_date' AND table_schema = 'public') THEN
        ALTER TABLE drivers RENAME COLUMN updated_at TO last_modified_date;
    END IF;
END $$;

-- 4. Update trigger name to match the new column name
DROP TRIGGER IF EXISTS update_drivers_updated_at ON drivers;

-- Create new trigger with updated column name
CREATE TRIGGER update_drivers_last_modified_date 
    BEFORE UPDATE ON drivers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update the trigger function to work with new column name
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle both old and new column names for backward compatibility
    IF TG_TABLE_NAME = 'drivers' THEN
        NEW.last_modified_date = CURRENT_TIMESTAMP;
    ELSE
        NEW.updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Add comments to document the inheritance relationship
COMMENT ON TABLE drivers IS 'Drivers table - extends customers (User) with driver-specific fields';
COMMENT ON COLUMN drivers.license_number IS 'Driver license number - moved from customers table';

-- 6. Optional: Add check to ensure no duplicate emails between customers and drivers
-- Note: This is optional since in practice, a person could be both a customer and a driver
-- Uncomment if you want to enforce mutual exclusivity:
-- ALTER TABLE drivers ADD CONSTRAINT chk_driver_email_unique 
--     EXCLUDE (email WITH =) WHERE (email IS NOT NULL);