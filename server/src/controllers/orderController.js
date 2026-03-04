const { query, pool } = require("../db/pool");

const TAX_RATE = parseFloat(process.env.TAX_RATE || "0.10");
const DELIVERY_FEE = 5.99;

// POST /api/orders
const createOrder = async (req, res) => {
    const { store_id, items, delivery_type = "pickup", delivery_address, notes, customer_id } = req.body;

    if (!store_id || !items || !items.length) {
        return res.status(400).json({ error: "store_id and items are required" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Validate stock for each item
        for (const item of items) {
            const inv = await client.query(
                `SELECT stock_quantity, reserved_quantity FROM store_inventory
         WHERE store_id = $1 AND product_id = $2 FOR UPDATE`,
                [store_id, item.product_id]
            );
            if (!inv.rows[0]) {
                throw { status: 400, message: `Product ${item.product_id} not available at this store` };
            }
            const available = inv.rows[0].stock_quantity - (inv.rows[0].reserved_quantity || 0);
            if (available < item.quantity) {
                throw { status: 400, message: `Insufficient stock for product ${item.product_id}. Available: ${available}` };
            }
        }

        // 2. Reserve stock
        for (const item of items) {
            await client.query(
                `UPDATE store_inventory
         SET reserved_quantity = reserved_quantity + $1, updated_at = NOW()
         WHERE store_id = $2 AND product_id = $3`,
                [item.quantity, store_id, item.product_id]
            );
        }

        // 3. Fetch product prices & calculate totals
        let subtotal = 0;
        const orderItemsData = [];
        for (const item of items) {
            const prod = await client.query("SELECT price FROM products WHERE id = $1", [item.product_id]);
            const unit_price = item.unit_price || prod.rows[0]?.price || 0;
            const line_total = parseFloat((unit_price * item.quantity).toFixed(2));
            subtotal += line_total;
            orderItemsData.push({ ...item, unit_price, line_total });
        }

        subtotal = parseFloat(subtotal.toFixed(2));
        const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
        const delivery_fee = delivery_type === "delivery" ? DELIVERY_FEE : 0;
        const total = parseFloat((subtotal + tax + delivery_fee).toFixed(2));

        // 4. Create order
        const orderResult = await client.query(
            `INSERT INTO orders (customer_id, store_id, subtotal, tax, delivery_fee, total, status, delivery_type, delivery_address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9) RETURNING *`,
            [customer_id || null, store_id, subtotal, tax, delivery_fee, total, delivery_type, delivery_address || null, notes || null]
        );
        const order = orderResult.rows[0];

        // 5. Insert order items
        for (const item of orderItemsData) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
                [order.id, item.product_id, item.quantity, item.unit_price, item.line_total]
            );
        }

        await client.query("COMMIT");
        res.status(201).json({ order, items: orderItemsData });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || "Failed to create order" });
    } finally {
        client.release();
    }
};

// GET /api/admin/orders?store_id=xxx&status=xxx
const getOrders = async (req, res) => {
    const { store_id, status, limit = 50, offset = 0 } = req.query;
    try {
        let sql = `
      SELECT o.*, s.name AS store_name,
             c.first_name, c.last_name, c.email AS customer_email,
             COUNT(oi.id) AS item_count
      FROM orders o
      JOIN stores s ON s.id = o.store_id
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE 1=1
    `;
        const params = [];
        let idx = 1;
        if (store_id) { sql += ` AND o.store_id = $${idx++}`; params.push(store_id); }
        if (status) { sql += ` AND o.status = $${idx++}`; params.push(status); }
        sql += ` GROUP BY o.id, s.name, c.first_name, c.last_name, c.email
             ORDER BY o.created_at DESC LIMIT $${idx++} OFFSET $${idx}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// GET /api/admin/orders/:id
const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const orderResult = await query(
            `SELECT o.*, s.name AS store_name, c.first_name, c.last_name, c.email AS customer_email
       FROM orders o
       JOIN stores s ON s.id = o.store_id
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = $1`,
            [id]
        );
        if (!orderResult.rows[0]) return res.status(404).json({ error: "Order not found" });

        const itemsResult = await query(
            `SELECT oi.*, p.name AS product_name, p.brand, p.image_url
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
            [id]
        );
        res.json({ ...orderResult.rows[0], items: itemsResult.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch order" });
    }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "ready", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const current = await client.query("SELECT status FROM orders WHERE id = $1 FOR UPDATE", [id]);
        if (!current.rows[0]) return res.status(404).json({ error: "Order not found" });

        const prevStatus = current.rows[0].status;

        // If confirming: deduct stock
        if (status === "confirmed" && prevStatus === "pending") {
            const items = await client.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", [id]);
            const order = await client.query("SELECT store_id FROM orders WHERE id = $1", [id]);
            const store_id = order.rows[0].store_id;
            for (const item of items.rows) {
                await client.query(
                    `UPDATE store_inventory
           SET stock_quantity = stock_quantity - $1,
               reserved_quantity = GREATEST(reserved_quantity - $1, 0),
               updated_at = NOW()
           WHERE store_id = $2 AND product_id = $3`,
                    [item.quantity, store_id, item.product_id]
                );
            }
        }

        // If cancelling: release reserved stock
        if (status === "cancelled" && prevStatus === "pending") {
            const items = await client.query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", [id]);
            const order = await client.query("SELECT store_id FROM orders WHERE id = $1", [id]);
            const store_id = order.rows[0].store_id;
            for (const item of items.rows) {
                await client.query(
                    `UPDATE store_inventory
           SET reserved_quantity = GREATEST(reserved_quantity - $1, 0),
               updated_at = NOW()
           WHERE store_id = $2 AND product_id = $3`,
                    [item.quantity, store_id, item.product_id]
                );
            }
        }

        const result = await client.query(
            "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [status, id]
        );
        await client.query("COMMIT");
        res.json(result.rows[0]);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
        res.status(500).json({ error: "Failed to update order status" });
    } finally {
        client.release();
    }
};

// GET /api/admin/dashboard
const getDashboardStats = async (req, res) => {
    const { store_id } = req.query;
    try {
        let storeFilter = store_id ? "AND o.store_id = $1" : "";
        const params = store_id ? [store_id] : [];

        const [revenueRes, ordersRes, lowStockRes, recentRes, customerRes] = await Promise.all([
            query(`SELECT COALESCE(SUM(total),0) AS total_revenue FROM orders o WHERE status NOT IN ('cancelled') ${storeFilter}`, params),
            query(`SELECT COUNT(*) AS total_orders, status FROM orders o WHERE 1=1 ${storeFilter} GROUP BY status`, params),
            query(`
        SELECT COUNT(*) AS count FROM store_inventory si
        WHERE (si.stock_quantity - COALESCE(si.reserved_quantity,0)) <= si.low_stock_threshold
        ${store_id ? "AND si.store_id = $1" : ""}
      `, params),
            query(`
        SELECT o.*, s.name AS store_name FROM orders o
        JOIN stores s ON s.id = o.store_id WHERE 1=1 ${storeFilter}
        ORDER BY o.created_at DESC LIMIT 5
      `, params),
            query("SELECT COUNT(*) AS count FROM customers"),
        ]);

        res.json({
            total_revenue: parseFloat(revenueRes.rows[0].total_revenue),
            orders_by_status: ordersRes.rows,
            low_stock_count: parseInt(lowStockRes.rows[0].count),
            recent_orders: recentRes.rows,
            total_clients: parseInt(customerRes.rows[0].count),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus, getDashboardStats };
