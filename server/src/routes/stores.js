const router = require("express").Router();
const { getStores } = require("../controllers/storeController");

router.get("/", getStores); // GET /api/stores

module.exports = router;
