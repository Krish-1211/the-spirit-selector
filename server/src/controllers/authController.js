const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../db/pool");

const generateToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

// POST /api/auth/register (customer)
const registerCustomer = async (req, res) => {
    const { first_name, last_name, email, password, date_of_birth, phone, address } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const exists = await query("SELECT id FROM customers WHERE email = $1", [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: "Email already registered" });
        }
        const password_hash = await bcrypt.hash(password, 12);
        const result = await query(
            `INSERT INTO customers (first_name, last_name, email, password_hash, date_of_birth, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name, phone, address`,
            [first_name, last_name, email, password_hash, date_of_birth || null, phone || null, address || null]
        );
        const user = result.rows[0];
        const token = generateToken({ id: user.id, email: user.email, role: "customer" });
        res.status(201).json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
};

// POST /api/auth/login (customer)
const loginCustomer = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }
    try {
        const result = await query(
            "SELECT * FROM customers WHERE email = $1",
            [email]
        );
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        const token = generateToken({ id: user.id, email: user.email, role: "customer" });
        const { password_hash, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
};

// POST /api/auth/admin/login
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }
    try {
        const result = await query("SELECT * FROM admins WHERE email = $1 AND is_active = true", [email]);
        const admin = result.rows[0];
        if (!admin) return res.status(401).json({ error: "Invalid credentials" });

        const valid = await bcrypt.compare(password, admin.password_hash);
        if (!valid) return res.status(401).json({ error: "Invalid credentials" });

        const token = generateToken({ id: admin.id, email: admin.email, role: admin.role });
        const { password_hash, ...safeAdmin } = admin;
        res.json({ token, user: safeAdmin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
};

// POST /api/auth/admin/register (superadmin only)
const registerAdmin = async (req, res) => {
    const { first_name, last_name, email, password, role = "admin" } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }
    try {
        const exists = await query("SELECT id FROM admins WHERE email = $1", [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: "Admin email already exists" });
        }
        const password_hash = await bcrypt.hash(password, 12);
        const result = await query(
            `INSERT INTO admins (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role`,
            [first_name, last_name, email, password_hash, role]
        );
        res.status(201).json({ admin: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create admin" });
    }
};

module.exports = { registerCustomer, loginCustomer, loginAdmin, registerAdmin };
