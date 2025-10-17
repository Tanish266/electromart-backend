const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/verifyToken");

router.post("/orders/place", verifyToken, orderController.placeOrder);
router.get(
  "/orders/user/:userId",
  verifyToken,
  orderController.getOrdersByUser
);
router.get("/orders/:orderId", verifyToken, orderController.getOrderDetails);
router.put("/orders/cancel/:orderId", verifyToken, orderController.cancelOrder);
router.get("/orders/all", verifyToken, orderController.getAllOrders);

module.exports = router;
