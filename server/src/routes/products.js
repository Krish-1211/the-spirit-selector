const router = require("express").Router();
const { getProducts, getProductById } = require("../controllers/productController");

// Public
router.get("/", getProducts);       // GET /api/products?store_id=&category=
router.get("/:id", getProductById); // GET /api/products/:id

module.exports = router;
