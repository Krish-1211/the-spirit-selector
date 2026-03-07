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

// POST /api/admin/products/bulk
const bulkCreateProducts = async (req, res) => {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: "An array of products is required" });
    }

    try {
        const values = [];
        const placeholders = [];
        let i = 1;

        for (const p of products) {
            placeholders.push(`($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`);
            values.push(
                p.name || '', p.brand || '', p.category || 'Other',
                p.alcohol_percentage || null, p.volume_ml || null, p.sku || '',
                p.price || 0, p.description || '', p.tasting_notes || '', p.image_url || ''
            );
        }

        const queryStr = `
            INSERT INTO products (name, brand, category, alcohol_percentage, volume_ml, sku, price, description, tasting_notes, image_url)
            VALUES ${placeholders.join(', ')}
            RETURNING *
        `;

        const result = await query(queryStr, values);
        res.status(201).json({ message: `Successfully inserted ${result.rowCount} products`, count: result.rowCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to bulk create products" });
    }
};

// GET /api/products/:id/recommendations
const getRecommendations = async (req, res) => {
    const { id } = req.params;
    const { store_id } = req.query;
    const limit = 4;

    try {
        const recommendations = [];
        const seenIds = new Set([id]); // Don't recommend the viewed product
        const limitReached = () => recommendations.length >= limit;

        const baseSelect = `
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
            LEFT JOIN store_inventory si ON si.product_id = p.id AND si.store_id = $2
            WHERE p.is_active = true 
              AND p.id != $1
        `;

        // Tier 1: Collaborative Filtering (Customers who bought this also bought...)
        const tier1Query = `
            SELECT p.*, 
                   si.stock_quantity, 
                   si.reserved_quantity,
                   si.low_stock_threshold,
                   CASE 
                     WHEN si.stock_quantity IS NULL THEN 'unavailable'
                     WHEN si.stock_quantity - COALESCE(si.reserved_quantity,0) <= 0 THEN 'out_of_stock'
                     WHEN si.stock_quantity - COALESCE(si.reserved_quantity,0) <= si.low_stock_threshold THEN 'low_stock'
                     ELSE 'in_stock'
                   END AS availability,
                   COUNT(oi2.product_id) as co_purchases
            FROM order_items oi1
            JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id != oi2.product_id
            JOIN products p ON oi2.product_id = p.id
            LEFT JOIN store_inventory si ON si.product_id = p.id AND si.store_id = $2
            WHERE oi1.product_id = $1 AND p.is_active = true
            GROUP BY p.id, si.stock_quantity, si.reserved_quantity, si.low_stock_threshold
            ORDER BY co_purchases DESC
            LIMIT $3;
        `;
        const tier1Result = await query(tier1Query, [id, store_id || null, limit]);

        for (const row of tier1Result.rows) {
            if (limitReached()) break;
            if (!seenIds.has(row.id)) {
                recommendations.push({ ...row, match_tier: 1, match_reason: 'Customers also bought' });
                seenIds.add(row.id);
            }
        }

        // Fetch reference product info for Tiers 2 & 3
        const refProductResult = await query(`SELECT category, brand, name FROM products WHERE id = $1`, [id]);
        const refProduct = refProductResult.rows[0];

        // Tier 2: Semantic Keyword Cross-selling (Complementary items based on category/name logic)
        if (!limitReached() && refProduct) {
            let semanticCategory = null;
            let semanticBrand = null;

            // Example Semantic Rules for Liquor:
            if (refProduct.category === 'Whiskey') semanticCategory = 'Other'; // e.g., Mixers, Bitters, Glasses if in Other
            else if (refProduct.category === 'Tequila') semanticCategory = 'Other'; // lime, salt, etc.
            else if (refProduct.category === 'Vodka') semanticCategory = 'Other';
            else semanticBrand = refProduct.brand; // Suggest same brand different category or just same brand

            let tier2Query = baseSelect + ` AND (si.stock_quantity - COALESCE(si.reserved_quantity,0) > 0) `;
            let tier2Params = [id, store_id || null];

            if (semanticCategory) {
                tier2Query += ` AND p.category = $3 `;
                tier2Params.push(semanticCategory);
            } else if (semanticBrand) {
                tier2Query += ` AND p.brand = $3 `;
                tier2Params.push(semanticBrand);
            }

            tier2Query += ` ORDER BY RANDOM() LIMIT $${tier2Params.length + 1}`;
            tier2Params.push(limit - recommendations.length);

            const tier2Result = await query(tier2Query, tier2Params);
            for (const row of tier2Result.rows) {
                if (limitReached()) break;
                if (!seenIds.has(row.id)) {
                    recommendations.push({ ...row, match_tier: 2, match_reason: 'Complementary pair' });
                    seenIds.add(row.id);
                }
            }
        }

        // Tier 3: Category-based Fallback
        if (!limitReached() && refProduct) {
            const tier3Query = baseSelect + ` AND p.category = $3 ORDER BY RANDOM() LIMIT $4`;
            const tier3Result = await query(tier3Query, [id, store_id || null, refProduct.category, limit - recommendations.length]);

            for (const row of tier3Result.rows) {
                if (limitReached()) break;
                if (!seenIds.has(row.id)) {
                    recommendations.push({ ...row, match_tier: 3, match_reason: 'Similar item' });
                    seenIds.add(row.id);
                }
            }
        }

        // Tier 4: General Latest Products Fallback
        if (!limitReached()) {
            const placeholders = Array.from(seenIds).map((_, i) => `$${i + 3}`).join(', ');
            let tier4Query = `
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
                LEFT JOIN store_inventory si ON si.product_id = p.id AND si.store_id = $2
                WHERE p.is_active = true 
                  AND p.id NOT IN (${placeholders})
                  AND (si.stock_quantity - COALESCE(si.reserved_quantity,0) > 0 OR si.stock_quantity IS NULL)
                ORDER BY p.created_at DESC
                LIMIT $1
            `;

            const params = [limit - recommendations.length, store_id || null, ...Array.from(seenIds)];
            // Adjust the limit parameter index because limit is at $1 in this query string but we push it first. 
            // Wait, query indexing in PG is 1-based and matches the array.
            // Let's rewrite tier4 properly parameterized
            // $1 = store_id, $2 = limit, $3..$N = seenIds
            const params4 = [store_id || null, limit - recommendations.length, ...Array.from(seenIds)];
            const inPlaceholders = Array.from(seenIds).map((_, i) => `$${i + 3}`).join(', ');

            const fixedTier4Query = `
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
                  AND p.id NOT IN (${inPlaceholders})
                  AND (si.stock_quantity - COALESCE(si.reserved_quantity,0) > 0)
                ORDER BY p.created_at DESC
                LIMIT $2
            `;

            const tier4Result = await query(fixedTier4Query, params4);

            for (const row of tier4Result.rows) {
                if (limitReached()) break;
                if (!seenIds.has(row.id)) {
                    recommendations.push({ ...row, match_tier: 4, match_reason: 'Trending item' });
                    seenIds.add(row.id);
                }
            }
        }

        res.json(recommendations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
};

module.exports = { getProducts, getProductById, getRecommendations, createProduct, updateProduct, deleteProduct, getAllProductsAdmin, bulkCreateProducts };
