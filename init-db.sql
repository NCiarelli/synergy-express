CREATE TABLE employees(
  id SERIAL PRIMARY KEY,
  name VARCHAR(40),
  dominant_personality VARCHAR(30),
  personality_profile TEXT,
  head_shot_url TEXT
);

CREATE TABLE survey_entries(
  id SERIAL PRIMARY KEY,
  employee_id INT,
  content TEXT,
  created BIGINT
);