CREATE TABLE files (
  id TEXT PRIMARY KEY,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE file_references (
  file_id TEXT NOT NULL,
  key TEXT NOT NULL,
  service_id TEXT NOT NULL,
  released_at TIMESTAMP,
  PRIMARY KEY(file_id, key)
);

CREATE INDEX ON file_references (file_id);
CREATE INDEX ON file_references (released_at);
