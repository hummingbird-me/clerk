CREATE TABLE files (
  id TEXT PRIMARY KEY,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE "references" (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  released_at TIMESTAMP
);

CREATE INDEX ON "references" (file_id);
CREATE INDEX ON "references" (released_at);
