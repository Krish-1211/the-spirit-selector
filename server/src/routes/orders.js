const router = require("express").Router();
const { createOrder } = require("../controllers/orderController");

// Public (customer)
router.post("/", createOrder); // POST /api/orders

module.exports = router;
