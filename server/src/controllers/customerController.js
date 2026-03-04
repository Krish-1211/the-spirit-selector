const { query } = require("../db/pool");

// GET /api/admin/customers
const getAllCustomers = async (req, res) => {
    try {
        const result = await query(
            `SELECT id, first_name, last_name, email, phone, address, created_at,
            (SELECT COUNT(*) FROM orders WHERE customer_id = customers.id) as total_orders,
            (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) as total_spent
            FROM customers
            ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
};

// GET /api/admin/customers/:id
const getCustomerById = async (req, res) => {
    const { id } = req.params;
    try {
        const customerResult = await query("SELECT * FROM customers WHERE id = $1", [id]);
        if (customerResult.rows.length === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }

        const ordersResult = await query(
            "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
            [id]
        );

        res.json({
            ...customerResult.rows[0],
            orders: ordersResult.rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch customer details" });
    }
};

// PUT /api/admin/customers/:id
const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address } = req.body;
    try {
        const result = await query(
            `UPDATE customers 
            SET first_name = $1, last_name = $2, email = $3, phone = $4, address = $5
            WHERE id = $6 RETURNING *`,
            [first_name, last_name, email, phone, address, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Customer not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update customer" });
    }
};

module.exports = { getAllCustomers, getCustomerById, updateCustomer };
