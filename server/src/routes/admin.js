const router = require("express").Router();
const { authenticate, adminOnly } = require("../middleware/auth");
const { createProduct, updateProduct, deleteProduct, getAllProductsAdmin } = require("../controllers/productController");
const { getOrders, getOrderById, updateOrderStatus, getDashboardStats } = require("../controllers/orderController");
const { getAllStores, createStore, updateStore } = require("../controllers/storeController");

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Products
router.get("/products", getAllProductsAdmin);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/status", updateOrderStatus);

// Stores
router.get("/stores", getAllStores);
router.post("/stores", createStore);
router.put("/stores/:id", updateStore);

module.exports = router;
