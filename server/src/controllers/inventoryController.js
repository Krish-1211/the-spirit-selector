const { query } = require("../db/pool");

// GET /api/admin/inventory?store_id=xxx
const getInventory = async (req, res) => {
    const { store_id } = req.query;
    try {
        let sql = `
      SELECT si.*, p.name AS product_name, p.brand, p.category, p.sku, p.price, p.image_url,
             s.name AS store_name,
             (si.stock_quantity - COALESCE(si.reserved_quantity, 0)) AS available_quantity
      FROM store_inventory si
      JOIN products p ON p.id = si.product_id
      JOIN stores s ON s.id = si.store_id
      WHERE p.is_active = true
    `;
        const params = [];
        if (store_id) {
            sql += " AND si.store_id = $1";
            params.push(store_id);
        }
        sql += " ORDER BY p.name ASC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch inventory" });
    }
};

// GET /api/admin/inventory/low-stock?store_id=xxx
const getLowStock = async (req, res) => {
    const { store_id } = req.query;
    try {
        let sql = `
      SELECT si.*, p.name AS product_name, p.brand, p.category, p.sku, s.name AS store_name,
             (si.stock_quantity - COALESCE(si.reserved_quantity, 0)) AS available_quantity
      FROM store_inventory si
      JOIN products p ON p.id = si.product_id AND p.is_active = true
      JOIN stores s ON s.id = si.store_id
      WHERE (si.stock_quantity - COALESCE(si.reserved_quantity, 0)) <= si.low_stock_threshold
    `;
        const params = [];
        if (store_id) {
            sql += " AND si.store_id = $1";
            params.push(store_id);
        }
        sql += " ORDER BY available_quantity ASC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch low stock items" });
    }
};

// PUT /api/admin/inventory/:id
const updateInventory = async (req, res) => {
    const { id } = req.params;
    const { stock_quantity, low_stock_threshold } = req.body;
    try {
        const result = await query(
            `UPDATE store_inventory
       SET stock_quantity = COALESCE($1, stock_quantity),
           low_stock_threshold = COALESCE($2, low_stock_threshold),
           updated_at = NOW()
       WHERE id = $3 RETURNING *`,
            [stock_quantity, low_stock_threshold, id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: "Inventory record not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update inventory" });
    }
};

// POST /api/admin/inventory (add product to store)
const addInventory = async (req, res) => {
    const { store_id, product_id, stock_quantity = 0, low_stock_threshold = 5 } = req.body;
    if (!store_id || !product_id) {
        return res.status(400).json({ error: "store_id and product_id are required" });
    }
    try {
        const result = await query(
            `INSERT INTO store_inventory (store_id, product_id, stock_quantity, low_stock_threshold)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (store_id, product_id) DO UPDATE
         SET stock_quantity = $3, low_stock_threshold = $4, updated_at = NOW()
       RETURNING *`,
            [store_id, product_id, stock_quantity, low_stock_threshold]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add inventory" });
    }
};

module.exports = { getInventory, getLowStock, updateInventory, addInventory };
