const { Pool } = require("pg");
require("dotenv").config({ path: __dirname + "/.env" });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url';", (err, res) => {
    if (err) console.error("Error:", err);
    else console.log("Success:", res.rows);
    pool.end();
});
