const { query } = require("../db/pool");

// GET /api/admin/settings
const getSettings = async (req, res) => {
    try {
        const result = await query("SELECT * FROM settings");
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
        });
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch settings" });
    }
};

// PUT /api/admin/settings
const updateSettings = async (req, res) => {
    const settings = req.body; // Expecting { key: value, ... }
    try {
        const keys = Object.keys(settings);
        for (const key of keys) {
            await query(
                "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
                [key, settings[key]]
            );
        }
        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update settings" });
    }
};

module.exports = { getSettings, updateSettings };
