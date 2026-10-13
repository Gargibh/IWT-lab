const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAdmin } = require("../middleware/authMiddleware");

router.get("/stats", requireAdmin, adminController.getStats);
router.get("/employees", requireAdmin, adminController.getAllEmployees);
router.get("/employees/:id", requireAdmin, adminController.getEmployeeById);
router.put("/employees/:id", requireAdmin, adminController.updateEmployee);
router.delete("/employees/:id", requireAdmin, adminController.deleteEmployee);

module.exports = router;
