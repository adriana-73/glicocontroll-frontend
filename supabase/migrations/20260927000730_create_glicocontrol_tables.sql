/*
# Create GlicoControl tables (single-tenant, no auth)

1. New Tables
- `patient_profile`: stores a single patient's info (nome, idade, peso, altura, medicamentos).
  - `id` (uuid, primary key) — fixed singleton row id for easy upsert.
  - `nome` (text, not null) — patient's full name.
  - `idade` (text) — age in years (kept as text to match frontend).
  - `peso` (text) — weight in kg.
  - `altura` (text) — height in cm.
  - `medicamentos` (text) — medications in use.
  - `updated_at` (timestamptz) — last modification time.

- `glicemia_records`: stores each glucose measurement.
  - `id` (uuid, primary key, default gen_random_uuid()).
  - `valor` (integer, not null) — glucose value in mg/dL.
  - `momento` (text, not null) — measurement context: jejum, pre-refeicao, pos-refeicao, aleatorio.
  - `horario` (text, not null) — time of day as HH:MM.
  - `data` (timestamptz, not null) — full timestamp of the reading.
  - `created_at` (timestamptz, default now()) — when the record was inserted.

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public (single-tenant app with no sign-in).

3. Important Notes
- This is a single-tenant app with no authentication screen, so policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`.
- The `patient_profile` table uses a fixed id ('00000000-0000-0000-0000-000000000001') for the singleton row, enabling simple upsert from the frontend.
*/

-- Patient profile table (singleton row)
CREATE TABLE IF NOT EXISTS patient_profile (
  id uuid PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  nome text NOT NULL DEFAULT '',
  idade text DEFAULT '',
  peso text DEFAULT '',
  altura text DEFAULT '',
  medicamentos text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patient_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profile" ON patient_profile;
CREATE POLICY "anon_select_profile" ON patient_profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profile" ON patient_profile;
CREATE POLICY "anon_insert_profile" ON patient_profile FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profile" ON patient_profile;
CREATE POLICY "anon_update_profile" ON patient_profile FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profile" ON patient_profile;
CREATE POLICY "anon_delete_profile" ON patient_profile FOR DELETE
  TO anon, authenticated USING (true);

-- Glicemia records table
CREATE TABLE IF NOT EXISTS glicemia_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  valor integer NOT NULL,
  momento text NOT NULL,
  horario text NOT NULL,
  data timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE glicemia_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_glicemia" ON glicemia_records;
CREATE POLICY "anon_select_glicemia" ON glicemia_records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_glicemia" ON glicemia_records;
CREATE POLICY "anon_insert_glicemia" ON glicemia_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_glicemia" ON glicemia_records;
CREATE POLICY "anon_update_glicemia" ON glicemia_records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_glicemia" ON glicemia_records;
CREATE POLICY "anon_delete_glicemia" ON glicemia_records FOR DELETE
  TO anon, authenticated USING (true);

-- Index for ordering by date descending (most recent first)
CREATE INDEX IF NOT EXISTS idx_glicemia_data_desc ON glicemia_records (data DESC);
