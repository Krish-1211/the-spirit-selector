const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};

const superadminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "superadmin") {
        return res.status(403).json({ error: "Superadmin access required" });
    }
    next();
};

module.exports = { authenticate, adminOnly, superadminOnly };
