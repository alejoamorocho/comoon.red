-- Add amount_reported column to cause_updates
-- Allows leaders to report donation amounts received (since donations are direct)
ALTER TABLE cause_updates ADD COLUMN amount_reported REAL;
