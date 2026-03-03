const router = require("express").Router();
const { authenticate, adminOnly } = require("../middleware/auth");
const { getInventory, getLowStock, updateInventory, addInventory } = require("../controllers/inventoryController");

router.use(authenticate, adminOnly);

router.get("/", getInventory);          // GET /api/admin/inventory?store_id=
router.get("/low-stock", getLowStock);  // GET /api/admin/inventory/low-stock
router.post("/", addInventory);         // POST /api/admin/inventory
router.put("/:id", updateInventory);    // PUT /api/admin/inventory/:id

module.exports = router;
