const mysql = require("mysql2");
const pool = require("../config/db");

const Order = {
  // Create a new order
  createOrder: (
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
    callback
  ) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return callback(err);
      }

      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return callback(err);
        }

        const shippingAddressData =
          typeof shippingAddress === "object"
            ? JSON.stringify(shippingAddress)
            : shippingAddress;

        const orderQuery = `
          INSERT INTO orders (
            customer_name, customer_email, customer_phone, shipping_address,
            payment_status, order_status, subtotal, discount, tax, total, user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const orderValues = [
          customerName,
          customerEmail,
          customerPhone,
          shippingAddressData,
          paymentStatus,
          orderStatus,
          subtotal,
          discount,
          tax,
          total,
          userId,
        ];

        connection.query(orderQuery, orderValues, (err, result) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err);
            });
          }

          const orderId = result.insertId;

          const itemsQuery = `
            INSERT INTO order_items (order_id, product_name, price, qty, total)
            VALUES ?
          `;
          const itemsData = orderItems.map((item) => [
            orderId,
            item.productName,
            item.price,
            item.quantity,
            item.total,
          ]);

          connection.query(itemsQuery, [itemsData], (err, itemsResult) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err);
              });
            }

            const stepsQuery = `
              INSERT INTO order_steps (order_id, step_title, step_description)
              VALUES (?, ?, ?)
            `;
            connection.query(
              stepsQuery,
              [
                orderId,
                "Order Placed",
                "The order has been successfully placed.",
              ],
              (err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    callback(err);
                  });
                }

                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      callback(err);
                    });
                  }
                  connection.release();
                  callback(null, { orderId, orderItems: itemsResult });
                });
              }
            );
          });
        });
      });
    });
  },

  // Fetch orders by user ID
  getOrdersByUser: (userId, callback) => {
    const query = `
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'productName', oi.product_name,
            'price', oi.price,
            'qty', oi.qty,
            'total', oi.total
          )
        ) AS orderItems
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    pool.query(query, [userId], (err, results) => {
      if (err) {
        return callback(err);
      }

      const parsedResults = results.map((order) => ({
        ...order,
        orderItems: Array.isArray(order.orderItems)
          ? order.orderItems
          : JSON.parse(order.orderItems || "[]"),
      }));

      callback(null, parsedResults);
    });
  },

  // Fetch a specific order by its ID (for modal view)
  getOrderDetails: (orderId, callback) => {
    const query = `
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'productName', oi.product_name,
            'price', oi.price,
            'qty', oi.qty,
            'total', oi.total
          )
        ) AS orderItems
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
      GROUP BY o.id
    `;

    pool.query(query, [orderId], (err, results) => {
      if (err) {
        console.error("Error fetching order details:", err);
        return callback(err);
      }

      if (results.length === 0) {
        console.log(`Order with ID ${orderId} not found`);
        return callback(new Error("Order not found"));
      }

      const parsedOrder = {
        ...results[0],
        orderItems: Array.isArray(results[0].orderItems)
          ? results[0].orderItems
          : JSON.parse(results[0].orderItems || "[]"),
      };

      callback(null, parsedOrder);
    });
  },

  // Update order status (e.g., cancel)
  updateOrderStatus: (orderId, status, callback) => {
    const query = `
      UPDATE orders
      SET order_status = ?
      WHERE id = ? AND order_status != 'Cancelled'
    `;

    pool.query(query, [status, orderId], (err, result) => {
      if (err) {
        return callback(err);
      }

      callback(null, result);
    });
  },

  // Fetch all orders (for admin view or general purpose)
  getAllOrders: (callback) => {
    const query = `
      SELECT o.*, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'productName', oi.product_name,
            'price', oi.price,
            'qty', oi.qty,
            'total', oi.total
          )
        ) AS orderItems
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    pool.query(query, (err, results) => {
      if (err) {
        return callback(err);
      }

      const parsedResults = results.map((order) => ({
        ...order,
        orderItems: Array.isArray(order.orderItems)
          ? order.orderItems
          : JSON.parse(order.orderItems || "[]"),
      }));

      callback(null, parsedResults);
    });
  },
};

module.exports = Order;
