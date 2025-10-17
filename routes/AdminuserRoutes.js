const express = require("express");
const router = express.Router();
const AdminuserController = require("../controllers/AdminuserController");

router.post("/adminusers", AdminuserController.createAdminUser);
router.post("/adminlogin", AdminuserController.loginAdminUser);
router.get("/admin-users/:id", AdminuserController.getAdminUserById);
router.put("/admin-users/:id", AdminuserController.updateAdminUser); // for profile update

module.exports = router;
