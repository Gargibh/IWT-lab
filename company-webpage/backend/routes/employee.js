const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const { requireAuth } = require("../middleware/authMiddleware");

// Every route below runs requireAuth FIRST - if there's no
// valid session, the controller function never even runs.
router.get("/profile", requireAuth, employeeController.getProfile);
router.post("/profile", requireAuth, employeeController.createProfile);
router.put("/profile", requireAuth, employeeController.updateProfile);

module.exports = router;
