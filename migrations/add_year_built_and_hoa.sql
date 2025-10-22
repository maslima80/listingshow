-- Add year_built and HOA fields to properties table
ALTER TABLE properties
  ADD COLUMN year_built integer,
  ADD COLUMN hoa_dues numeric(10, 2),
  ADD COLUMN hoa_period varchar(20); -- 'month', 'quarter', 'year'

-- Add comments for documentation
COMMENT ON COLUMN properties.year_built IS 'Year the property was built';
COMMENT ON COLUMN properties.hoa_dues IS 'HOA dues amount';
COMMENT ON COLUMN properties.hoa_period IS 'HOA payment period: month, quarter, or year';
