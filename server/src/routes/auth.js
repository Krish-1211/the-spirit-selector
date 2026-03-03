const router = require("express").Router();
const { registerCustomer, loginCustomer, loginAdmin, registerAdmin } = require("../controllers/authController");
const { authenticate, adminOnly, superadminOnly } = require("../middleware/auth");

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.post("/admin/login", loginAdmin);
router.post("/admin/register", authenticate, superadminOnly, registerAdmin);

module.exports = router;
