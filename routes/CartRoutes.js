const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController");

router.post("/cart/addcart", CartController.addToCart);
router.put("/update-quantity", CartController.updateCartQuantity);
router.delete("/cart/remove", CartController.removeFromCart);

module.exports = router;
