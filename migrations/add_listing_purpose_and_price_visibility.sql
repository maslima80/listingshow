-- Add listing purpose, property type, and price visibility fields
-- Migration: Add listing purpose and price visibility

-- Add enum types
CREATE TYPE listing_purpose AS ENUM ('sale', 'rent', 'coming_soon');
CREATE TYPE property_type AS ENUM ('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'lot', 'commercial', 'other');
CREATE TYPE price_visibility AS ENUM ('show', 'upon_request', 'contact');

-- Add new columns to properties table
ALTER TABLE properties
  ADD COLUMN listing_purpose listing_purpose DEFAULT 'sale' NOT NULL,
  ADD COLUMN property_type property_type,
  ADD COLUMN price_visibility price_visibility DEFAULT 'show' NOT NULL,
  ADD COLUMN rent_period varchar(20), -- 'month', 'week', 'night'
  ALTER COLUMN price DROP NOT NULL; -- Make price optional

-- Update existing properties to have default values
UPDATE properties SET listing_purpose = 'sale' WHERE listing_purpose IS NULL;
UPDATE properties SET price_visibility = 'show' WHERE price_visibility IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN properties.listing_purpose IS 'Purpose of listing: sale, rent, or coming_soon';
COMMENT ON COLUMN properties.property_type IS 'Type of property: single_family, condo, townhouse, etc.';
COMMENT ON COLUMN properties.price_visibility IS 'How to display price: show, upon_request, or contact';
COMMENT ON COLUMN properties.rent_period IS 'Rental period: month, week, or night (only for rent listings)';
