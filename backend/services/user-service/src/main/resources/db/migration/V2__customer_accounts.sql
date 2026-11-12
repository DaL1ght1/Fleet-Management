ALTER TABLE customers ADD COLUMN account_id UUID;

ALTER TABLE customers ADD CONSTRAINT uq_customers_account UNIQUE (account_id);
