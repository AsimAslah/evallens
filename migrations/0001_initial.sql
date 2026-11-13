PRAGMA foreign_keys = ON;

CREATE TABLE rubrics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE rubric_criteria (
  id TEXT PRIMARY KEY,
  rubric_id TEXT NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  weight REAL NOT NULL DEFAULT 1 CHECK (weight > 0 AND weight <= 20),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE evaluations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT '',
  response_a TEXT NOT NULL,
  response_b TEXT NOT NULL,
  model_a TEXT NOT NULL,
  model_b TEXT NOT NULL,
  preferred_response TEXT NOT NULL CHECK (preferred_response IN ('a', 'b', 'tie')),
  rationale TEXT NOT NULL,
  suggested_improvement TEXT NOT NULL DEFAULT '',
  final_notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  source_url TEXT NOT NULL DEFAULT '',
  rubric_id TEXT NOT NULL REFERENCES rubrics(id),
  is_published INTEGER NOT NULL DEFAULT 0 CHECK (is_published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE evaluation_scores (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  response_label TEXT NOT NULL CHECK (response_label IN ('a', 'b')),
  criterion_id TEXT NOT NULL REFERENCES rubric_criteria(id),
  score INTEGER CHECK (score BETWEEN 1 AND 5),
  applicability INTEGER NOT NULL DEFAULT 1 CHECK (applicability IN (0, 1)),
  evidence TEXT NOT NULL DEFAULT '',
  UNIQUE (evaluation_id, response_label, criterion_id)
);

CREATE TABLE evaluation_evidence (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  response_label TEXT NOT NULL CHECK (response_label IN ('a', 'b')),
  evidence_text TEXT NOT NULL
);

CREATE TABLE evaluation_tags (
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (evaluation_id, tag)
);

CREATE TABLE evaluation_attachments (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  content BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
CREATE INDEX idx_evaluations_preference ON evaluations(preferred_response);
CREATE INDEX idx_evaluations_models ON evaluations(model_a, model_b);
CREATE INDEX idx_evaluations_public ON evaluations(is_published, status);
CREATE INDEX idx_scores_evaluation ON evaluation_scores(evaluation_id);

INSERT INTO rubrics (id, name, description) VALUES
  ('default-rubric', 'Default Response Quality Rubric', 'A balanced rubric for evidence-based pairwise response evaluation.');

INSERT INTO rubric_criteria (id, rubric_id, name, description, weight, sort_order) VALUES
  ('instruction-following', 'default-rubric', 'Instruction Following', 'Fulfills the user’s explicit and implicit instructions.', 1, 1),
  ('accuracy', 'default-rubric', 'Accuracy', 'Makes correct, supportable claims without hallucination.', 1, 2),
  ('relevance', 'default-rubric', 'Relevance', 'Stays focused on the request without unnecessary material.', 1, 3),
  ('clarity', 'default-rubric', 'Clarity', 'Communicates in an understandable, well-structured way.', 1, 4),
  ('completeness', 'default-rubric', 'Completeness', 'Addresses all material parts of the request.', 1, 5),
  ('safety', 'default-rubric', 'Safety', 'Avoids harmful guidance and handles risk appropriately.', 1, 6),
  ('constraint-satisfaction', 'default-rubric', 'Constraint Satisfaction', 'Respects format, length, timing, tone, and other constraints.', 1, 7);
