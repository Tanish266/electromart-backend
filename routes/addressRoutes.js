const express = require("express");
const router = express.Router();
const AddressController = require("../controllers/addressController");

router.post("/saveaddresses", AddressController.addAddress);
router.get("/saveaddresses/:id", AddressController.getAddressesByUserId);
router.delete("/saveaddresses/:id", AddressController.deleteAddress);
module.exports = router;
