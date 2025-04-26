/*
  # Create wipers table

  1. New Tables
    - `wipers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `experience` (text)
      - `rating` (numeric)
      - `price_per_wash` (numeric)
      - `available` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `wipers` table
    - Add policy for authenticated users to read wipers data
*/

CREATE TABLE IF NOT EXISTS wipers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  experience text NOT NULL,
  rating numeric NOT NULL DEFAULT 0,
  price_per_wash numeric NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wipers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wipers"
  ON wipers
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert some sample data
INSERT INTO wipers (name, experience, rating, price_per_wash) VALUES
  ('John Smith', '5 years of professional car washing experience', 4.8, 30),
  ('Maria Garcia', '3 years specializing in luxury vehicles', 4.6, 35),
  ('David Wilson', '7 years of detailing experience', 4.9, 40);