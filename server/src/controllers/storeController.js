const { query } = require("../db/pool");

const getStores = async (req, res) => {
    try {
        const result = await query("SELECT * FROM stores WHERE is_active = true ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch stores" });
    }
};

const getAllStores = async (req, res) => {
    try {
        const result = await query("SELECT * FROM stores ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch stores" });
    }
};

const createStore = async (req, res) => {
    const { name, address, city, state, zip_code, phone } = req.body;
    if (!name || !address || !city || !state || !zip_code) {
        return res.status(400).json({ error: "name, address, city, state, zip_code are required" });
    }
    try {
        const result = await query(
            `INSERT INTO stores (name, address, city, state, zip_code, phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [name, address, city, state, zip_code, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create store" });
    }
};

const updateStore = async (req, res) => {
    const { id } = req.params;
    const { name, address, city, state, zip_code, phone, is_active } = req.body;
    try {
        const result = await query(
            `UPDATE stores SET
         name = COALESCE($1, name),
         address = COALESCE($2, address),
         city = COALESCE($3, city),
         state = COALESCE($4, state),
         zip_code = COALESCE($5, zip_code),
         phone = COALESCE($6, phone),
         is_active = COALESCE($7, is_active)
       WHERE id = $8 RETURNING *`,
            [name, address, city, state, zip_code, phone, is_active, id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: "Store not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update store" });
    }
};

module.exports = { getStores, getAllStores, createStore, updateStore };
