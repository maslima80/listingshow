-- Change baths column from integer to numeric to support 0.5 increments
-- This allows values like 1.5, 2.5, etc. for half bathrooms

ALTER TABLE properties 
ALTER COLUMN baths TYPE NUMERIC(3,1) 
USING baths::numeric(3,1);

-- Add comment explaining the column
COMMENT ON COLUMN properties.baths IS 'Number of bathrooms, supports 0.5 increments (e.g., 1.5, 2.5)';
