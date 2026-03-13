const { query } = require("../db/pool");

const getVendors = async (req, res) => {
    try {
        const result = await query("SELECT * FROM vendors WHERE is_active = true ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
};

const createVendor = async (req, res) => {
    const { name, email, phone, address, contact_person } = req.body;
    try {
        const result = await query(
            "INSERT INTO vendors (name, email, phone, address, contact_person) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [name, email, phone, address, contact_person]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create vendor" });
    }
};

module.exports = { getVendors, createVendor };
