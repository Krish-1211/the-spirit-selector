const { query } = require("../db/pool");

const getPurchaseOrders = async (req, res) => {
    const { vendor_id, store_id, status } = req.query;
    try {
        let sql = `
            SELECT po.*, v.name as vendor_name, s.name as store_name,
                   (SELECT COUNT(*) FROM purchase_order_items WHERE po_id = po.id) as item_count
            FROM purchase_orders po
            JOIN vendors v ON po.vendor_id = v.id
            JOIN stores s ON po.store_id = s.id
            WHERE 1=1
        `;
        const params = [];
        let idx = 1;

        if (vendor_id) {
            sql += ` AND po.vendor_id = $${idx++}`;
            params.push(vendor_id);
        }
        if (store_id) {
            sql += ` AND po.store_id = $${idx++}`;
            params.push(store_id);
        }
        if (status) {
            sql += ` AND po.status = $${idx++}`;
            params.push(status);
        }

        sql += " ORDER BY po.created_at DESC";
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
};

const getPurchaseOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const po = await query(`
            SELECT po.*, v.name as vendor_name, s.name as store_name
            FROM purchase_orders po
            JOIN vendors v ON po.vendor_id = v.id
            JOIN stores s ON po.store_id = s.id
            WHERE po.id = $1
        `, [id]);
        
        if (!po.rows[0]) return res.status(404).json({ error: "Purchase order not found" });

        const items = await query(`
            SELECT poi.*, p.name as product_name, p.sku, p.brand
            FROM purchase_order_items poi
            JOIN products p ON poi.product_id = p.id
            WHERE poi.po_id = $1
        `, [id]);

        res.json({ ...po.rows[0], items: items.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch purchase order details" });
    }
};

const createPurchaseOrder = async (req, res) => {
    const { vendor_id, store_id, notes, items } = req.body;
    if (!vendor_id || !store_id || !items || !items.length) {
        return res.status(400).json({ error: "vendor_id, store_id, and items are required" });
    }
    
    try {
        // Start transaction manually if needed
        const poResult = await query(
            "INSERT INTO purchase_orders (vendor_id, store_id, notes) VALUES ($1, $2, $3) RETURNING *",
            [vendor_id, store_id, notes]
        );
        const po = poResult.rows[0];
        
        let total = 0;
        for (const item of items) {
            const lineTotal = item.quantity * item.unit_cost;
            total += lineTotal;
            await query(
                "INSERT INTO purchase_order_items (po_id, product_id, quantity, unit_cost, line_total) VALUES ($1, $2, $3, $4, $5)",
                [po.id, item.product_id, item.quantity, item.unit_cost, lineTotal]
            );
        }
        
        await query("UPDATE purchase_orders SET total_amount = $1 WHERE id = $2", [total, po.id]);
        
        res.status(201).json({ ...po, total_amount: total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create purchase order" });
    }
};

const updatePOStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await query(
            "UPDATE purchase_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [status, id]
        );
        
        if (!result.rows[0]) return res.status(404).json({ error: "Purchase order not found" });

        // If status is 'received', update inventory
        if (status === 'received') {
            const items = await query("SELECT * FROM purchase_order_items WHERE po_id = $1", [id]);
            const po = await query("SELECT store_id FROM purchase_orders WHERE id = $1", [id]);
            const storeId = po.rows[0].store_id;
            
            for (const item of items.rows) {
                await query(`
                    INSERT INTO store_inventory (store_id, product_id, stock_quantity)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (store_id, product_id)
                    DO UPDATE SET stock_quantity = store_inventory.stock_quantity + $3, updated_at = NOW()
                `, [storeId, item.product_id, item.quantity]);
            }
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
};

module.exports = { getPurchaseOrders, getPurchaseOrderById, createPurchaseOrder, updatePOStatus };
