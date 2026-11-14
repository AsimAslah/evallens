PRAGMA foreign_keys = ON;

ALTER TABLE rubrics ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE TABLE evaluation_criteria_snapshots (
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criterion_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  weight REAL NOT NULL CHECK (weight > 0 AND weight <= 20),
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (evaluation_id, criterion_id)
);

CREATE INDEX idx_evaluation_criteria_snapshot ON evaluation_criteria_snapshots(evaluation_id, sort_order);

INSERT INTO evaluation_criteria_snapshots (evaluation_id, criterion_id, name, description, weight, sort_order)
SELECT e.id, c.id, c.name, c.description, c.weight, c.sort_order
FROM evaluations e
JOIN rubric_criteria c ON c.rubric_id = e.rubric_id;
