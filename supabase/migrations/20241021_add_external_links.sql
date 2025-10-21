-- Add external_links column to properties table
-- Stores array of external listing links (Zillow, Realtor.com, MLS, etc.)

ALTER TABLE properties 
ADD COLUMN external_links JSONB;

-- Add comment explaining the column
COMMENT ON COLUMN properties.external_links IS 'Array of external listing links with label and url: [{"label": "Zillow", "url": "https://..."}]';

-- Example data structure:
-- [
--   {"label": "Zillow", "url": "https://zillow.com/..."},
--   {"label": "Realtor.com", "url": "https://realtor.com/..."},
--   {"label": "MLS Listing", "url": "https://..."}
-- ]
