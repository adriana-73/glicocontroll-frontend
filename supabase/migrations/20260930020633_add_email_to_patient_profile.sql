/*
# Add email column to patient_profile

1. Modified Tables
- `patient_profile`: adds `email` (text, not null, default '') — patient's email address.
  The column is added with a safe idempotent DO block so re-running the migration is harmless.

2. Security
- No policy changes needed — existing anon/authenticated CRUD policies on patient_profile
  already cover all columns. RLS remains enabled.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_profile' AND column_name = 'email'
  ) THEN
    ALTER TABLE patient_profile ADD COLUMN email text NOT NULL DEFAULT '';
  END IF;
END $$;
