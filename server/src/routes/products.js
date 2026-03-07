const router = require("express").Router();
const { getProducts, getProductById, getRecommendations } = require("../controllers/productController");

// Public
router.get("/", getProducts);       // GET /api/products?store_id=&category=
router.get("/:id", getProductById); // GET /api/products/:id
router.get("/:id/recommendations", getRecommendations); // GET /api/products/:id/recommendations

module.exports = router;
