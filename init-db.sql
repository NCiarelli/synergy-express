CREATE TABLE employees(
  id SERIAL PRIMARY KEY,
  name VARCHAR(40),
  dominant_personality VARCHAR(30),
  personality_profile TEXT,
  head_shot_url TEXT,
  team_ids INT[],
  notes TEXT
);

CREATE TABLE survey_entries(
  id SERIAL PRIMARY KEY,
  employee_id INT,
  content TEXT,
  created BIGINT
);

CREATE TABLE teams(
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(40),
  member_ids INT[],
  notes TEXT
);