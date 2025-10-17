const db = require("../config/db");

const CartModel = {
  // Add to cart
  AddToCart: async (
    userId,
    productId,
    productName,
    productBrand,
    mainImage,
    price,
    quantity,
    variantColor,
    variantSize
  ) => {
    try {
      // Check if the item already exists in the cart
      const checkQuery = `
        SELECT * FROM cart 
        WHERE userId = ? AND productId = ? AND variantColor = ? AND variantSize = ?
      `;
      const checkValues = [userId, productId, variantColor, variantSize];

      const [existingCart] = await db.promise().query(checkQuery, checkValues);

      if (existingCart.length > 0) {
        // If the item exists, update the quantity
        const updateQuery = `
          UPDATE cart
          SET quantity = quantity + ?
          WHERE userId = ? AND productId = ? AND variantColor = ? AND variantSize = ?
        `;
        const updateValues = [
          quantity,
          userId,
          productId,
          variantColor,
          variantSize,
        ];
        await db.promise().query(updateQuery, updateValues);

        console.log("Cart updated with new quantity.");
        return { message: "Product quantity updated in cart." };
      } else {
        // If the item doesn't exist, insert a new entry
        const insertQuery = `
          INSERT INTO cart (
            userId, productId, productName, productBrand,
            mainImage, price, quantity, variantColor, variantSize
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [
          userId,
          productId,
          productName,
          productBrand,
          mainImage,
          price,
          quantity,
          variantColor,
          variantSize,
        ];

        const [result] = await db.promise().query(insertQuery, insertValues);
        console.log("Product added to cart:", result);
        return result;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw new Error("Database Error: Unable to add product to cart.");
    }
  },

  // Update cart quantity
  UpdateCartQuantity: async (
    userId,
    productId,
    variantColor,
    variantSize,
    quantity
  ) => {
    try {
      const query = `
        UPDATE cart
        SET quantity = ?
        WHERE userId = ? AND productId = ? AND variantColor = ? AND variantSize = ?
      `;
      const values = [quantity, userId, productId, variantColor, variantSize];

      console.log("Executing query:", query, "with values:", values);

      const [result] = await db.promise().query(query, values);
      return result;
    } catch (err) {
      console.error("Error updating cart quantity:", err);
      throw new Error("Database Error: Unable to update cart quantity.");
    }
  },

  // Remove item from cart
  RemoveFromCart: async (userId, productId, variantColor, variantSize) => {
    try {
      const query = `
      DELETE FROM cart
      WHERE userId = ? AND productId = ? AND variantColor = ? AND variantSize = ?
    `;
      const values = [userId, productId, variantColor, variantSize];

      const [result] = await db.promise().query(query, values);
      return result;
    } catch (err) {
      console.error("Error removing from cart:", err);
      throw new Error("Database Error: Unable to remove product from cart.");
    }
  },
};

module.exports = CartModel;
