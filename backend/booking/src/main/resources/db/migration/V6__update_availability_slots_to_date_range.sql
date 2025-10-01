-- Drop the day_of_week column and add date range columns
ALTER TABLE availability_slots
DROP COLUMN day_of_week,
ADD COLUMN start_date DATE NOT NULL,
ADD COLUMN end_date DATE NOT NULL;

