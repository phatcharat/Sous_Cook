-- users
CREATE TABLE users (
  "user_id" SERIAL PRIMARY KEY,
  "username" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) UNIQUE NOT NULL,
  "password_hash" TEXT,
  "google_id" VARCHAR(255) UNIQUE,
  "avatar"  TEXT,
  "phone_number" VARCHAR(10),
  "birth_date" DATE,
  "country" VARCHAR(50),
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP,
  "deleted_at" TIMESTAMP
);

-- menus
CREATE TABLE menus (
    "menu_id" SERIAL PRIMARY KEY,
    "menu_name"   VARCHAR(225) NOT NULL UNIQUE,
    "prep_time" VARCHAR(50),
    "cooking_time" VARCHAR(50),
    "steps" JSONB,
    "ingredients_quantity" JSONB,
    "ingredients_type" JSONB,
    "nutrition" JSONB,
    "image" TEXT
);

-- ingredients
CREATE TABLE ingredients (
    "ingredient_id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) UNIQUE NOT NULL,
    "unit" VARCHAR(100)
);

-- menus_ingredients
CREATE TABLE menus_ingredients (
    "menu_id" INT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
    "ingredient_id" INT NOT NULL REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    "quantity"  NUMERIC(12,3),
    PRIMARY KEY (menu_id, ingredient_id)
);

-- favorite menu
CREATE TABLE favorite_menu (
    "favorite_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "menu_id" INT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, menu_id)
);

-- review
CREATE TABLE review (
    "review_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "menu_id" INT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
    "rating"   SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    "comment"  TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, menu_id)
);

-- history
CREATE TABLE history (
    "history_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "menu_id" INT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_menu UNIQUE (user_id, menu_id)
);

-- community
CREATE TABLE community (
    "post_id" SERIAL PRIMARY KEY,
    "user_id" INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    "menu_id" INT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
    "image"   TEXT,
    "caption" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- nutrition
-- CREATE TABLE nutrition (
--     "nutrition_id" SERIAL PRIMARY KEY,
--     "menu_id" INT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
--     "calories"  NUMERIC(10,2),
--     "fat"  NUMERIC(10,2),
--     "sodium"  NUMERIC(10,2),
--     "carbs"  NUMERIC(10,2),
--     "sugar"  NUMERIC(10,2),
--     "protein"  NUMERIC(10,2),
--     UNIQUE (menu_id)
-- );
