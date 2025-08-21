const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error("Error",err.stack);
    }
    console.log("connected to PostgreSQL DB");
    release();
});

module.exports = pool;