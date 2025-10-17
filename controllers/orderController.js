const Order = require("../models/orderModel");
const { decreaseProductQty } = require("./addProductController");

// Utility function for error responses
const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

// Place a new order
exports.placeOrder = async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    paymentStatus,
    orderStatus,
    subtotal,
    discount,
    tax,
    total,
    userId,
    orderItems,
  } = req.body;

  // Validate required fields
  if (!customerName || !customerEmail || !orderItems || !orderItems.length) {
    return handleError(res, 400, "Required fields missing");
  }

  try {
    Order.createOrder(
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      paymentStatus,
      orderStatus,
      subtotal,
      discount,
      tax,
      total,
      orderItems,
      userId,
      (err, result) => {
        if (err) {
          console.error("Error placing order:", err);
          return handleError(res, 500, "Failed to place order");
        }

        const orderId = result.orderId; // Capture orderId here
        decreaseProductQty(orderId); // Decrease product quantity after order is placed
        console.log("Decreasing product qty for orderId:", orderId);

        return res.status(200).json({
          success: true,
          message: "Order placed successfully",
          orderId: orderId,
        });
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return handleError(res, 500, "Internal Server Error");
  }
};

// Get all orders for a user
exports.getOrdersByUser = (req, res) => {
  const { userId } = req.params;

  Order.getOrdersByUser(userId, (err, orders) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return handleError(res, 500, "Failed to fetch orders");
    }

    res.status(200).json({
      success: true,
      orders,
    });
  });
};

// Get order details by order ID
exports.getOrderDetails = (req, res) => {
  const { orderId } = req.params;

  if (orderId === "all") {
    // Special case: if 'all' is passed, fetch all orders
    Order.getAllOrders((err, orders) => {
      if (err) {
        console.error("Error fetching all orders:", err);
        return handleError(res, 500, "Failed to fetch all orders");
      }

      return res.status(200).json({
        success: true,
        orders,
      });
    });
  } else {
    // Fetch a specific order if not 'all'
    Order.getOrderDetails(orderId, (err, orderDetails) => {
      if (err) {
        console.error("Error fetching order details:", err);
        if (err.message === "Order not found") {
          return handleError(res, 404, "Order not found");
        }
        return handleError(res, 500, "Failed to fetch order details");
      }

      res.status(200).json({
        success: true,
        order: orderDetails,
      });
    });
  }
};

// Cancel an order
exports.cancelOrder = (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return handleError(res, 400, "Order ID is required");
  }

  Order.updateOrderStatus(orderId, "Cancelled", (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      return handleError(res, 500, "Error updating order status");
    }

    if (result.affectedRows === 0) {
      return handleError(res, 404, "Order not found or already cancelled");
    }

    return res
      .status(200)
      .json({ success: true, message: "Order has been cancelled" });
  });
};

// Fetch all orders
exports.getAllOrders = (req, res) => {
  Order.getAllOrders((err, orders) => {
    if (err) {
      console.error("Error fetching all orders:", err);
      return handleError(res, 500, "Failed to fetch all orders");
    }

    res.status(200).json({
      success: true,
      orders,
    });
  });
};
