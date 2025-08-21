CREATE TABLE users (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "hashed_password" TEXT,
  "created_at" TIMESTAMP,
  "updated_at" TIMESTAMP,
  "deleted_at" TIMESTAMP
);