
-- users
CREATE TABLE users (
  "user_id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "password_hash" TEXT,
  "avatar"  TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP,
  "deleted_at" TIMESTAMP
);

-- recipes
CREATE TABLE recipes (
    "recipe_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "title"   VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ingredients
CREATE TABLE ingredients (
    "ingredient_id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) UNIQUE NOT NULL,
    "unit" VARCHAR(100)
);

-- recipes_ingredients
CREATE TABLE recipes_ingredients (
    "recipe_id" INT NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    "ingredient_id" INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    "quantity"  NUMERIC(12,3),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- favorite menu
CREATE TABLE favorite_menu (
    "favorite_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "recipe_id" INT NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, recipe_id)
);

-- review
CREATE TABLE review (
    "review_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "recipe_id" INT NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    "rating"   SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    "comment"  TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, recipe_id)
);

-- history
CREATE TABLE history (
    "history_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "recipe_id" INT NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- community
CREATE TABLE community (
    "post_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "recipe_id" INT NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    "image"   TEXT,
    "caption" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- nutrition
CREATE TABLE nutrition (
    "nutrition_id" SERIAL PRIMARY KEY,
    "recipe_id" INT NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    "calories"  NUMERIC(10,2),
    "fat"  NUMERIC(10,2),
    "sodium"  NUMERIC(10,2),
    "carbs"  NUMERIC(10,2),
    "sugar"  NUMERIC(10,2),
    "protein"  NUMERIC(10,2),
    UNIQUE (recipe_id)
);
