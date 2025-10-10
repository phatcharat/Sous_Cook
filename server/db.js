const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error connecting to DB:", err.stack);
  }
  console.log("Connected to PostgreSQL DB on Railway");
  release();
});

module.exports = pool;