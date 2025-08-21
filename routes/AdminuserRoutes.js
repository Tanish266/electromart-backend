const express = require("express");
const router = express.Router();
const AdminuserController = require("../controllers/AdminuserController");

router.post("/adminusers", AdminuserController.createAdminUser);
router.post("/adminlogin", AdminuserController.loginAdminUser);
router.get("/admin-users/:id", AdminuserController.getAdminUserById);

module.exports = router;
