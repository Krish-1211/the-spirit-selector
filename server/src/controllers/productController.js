const { query } = require("../db/pool");

// GET /api/products?store_id=xxx&category=xxx
const getProducts = async (req, res) => {
    const { store_id, category, search } = req.query;
    try {
        let sql = `
      SELECT p.*, 
             si.stock_quantity, 
             si.reserved_quantity,
             si.low_stock_threshold,
             CASE 
               WHEN si.stock_quantity IS NULL THEN 'unavailable'
               WHEN si.stock_quantity - COALESCE(si.reserved_quantity,0) <= 0 THEN 'out_of_stock'
               WHEN si.stock_quantity - COALESCE(si.reserved_quantity,0) <= si.low_stock_threshold THEN 'low_stock'
               ELSE 'in_stock'
             END AS availability
      FROM products p
      LEFT JOIN store_inventory si ON si.product_id = p.id AND si.store_id = $1
      WHERE p.is_active = true
    `;
        const params = [store_id || null];
        let idx = 2;

        if (category) {
            sql += ` AND p.category = $${idx++}`;
            params.push(category);
        }
        if (search) {
            sql += ` AND (p.name ILIKE $${idx} OR p.brand ILIKE $${idx})`;
            params.push(`%${search}%`);
            idx++;
        }
        sql += " ORDER BY p.name ASC";

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
    const { id } = req.params;
    const { store_id } = req.query;
    try {
        const result = await query(
            `SELECT p.*, si.stock_quantity, si.reserved_quantity
       FROM products p
       LEFT JOIN store_inventory si ON si.product_id = p.id AND si.store_id = $2
       WHERE p.id = $1`,
            [id, store_id || null]
        );
        if (!result.rows[0]) return res.status(404).json({ error: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

// POST /api/admin/products
const createProduct = async (req, res) => {
    const { name, brand, category, alcohol_percentage, volume_ml, sku, price, description, tasting_notes, image_url } = req.body;
    if (!name || !brand || !category || price == null) {
        return res.status(400).json({ error: "name, brand, category, and price are required" });
    }
    try {
        const result = await query(
            `INSERT INTO products (name, brand, category, alcohol_percentage, volume_ml, sku, price, description, tasting_notes, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
            [name, brand, category, alcohol_percentage, volume_ml, sku, price, description, tasting_notes, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create product" });
    }
};

// PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, brand, category, alcohol_percentage, volume_ml, sku, price, description, tasting_notes, image_url, is_active } = req.body;
    try {
        const result = await query(
            `UPDATE products SET
         name = COALESCE($1, name),
         brand = COALESCE($2, brand),
         category = COALESCE($3, category),
         alcohol_percentage = COALESCE($4, alcohol_percentage),
         volume_ml = COALESCE($5, volume_ml),
         sku = COALESCE($6, sku),
         price = COALESCE($7, price),
         description = COALESCE($8, description),
         tasting_notes = COALESCE($9, tasting_notes),
         image_url = COALESCE($10, image_url),
         is_active = COALESCE($11, is_active)
       WHERE id = $12 RETURNING *`,
            [name, brand, category, alcohol_percentage, volume_ml, sku, price, description, tasting_notes, image_url, is_active, id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: "Product not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update product" });
    }
};

// DELETE /api/admin/products/:id (soft delete)
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await query("UPDATE products SET is_active = false WHERE id = $1", [id]);
        res.json({ message: "Product deactivated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

// GET /api/admin/products (all, including inactive)
const getAllProductsAdmin = async (req, res) => {
    try {
        const result = await query("SELECT * FROM products ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAllProductsAdmin };
