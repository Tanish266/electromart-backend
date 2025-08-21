const CartModel = require("../models/CartModel");

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const {
      userId,
      productId,
      productName,
      productBrand,
      mainImage,
      price,
      quantity,
      variantColor,
      variantSize,
    } = req.body;

    if (
      !userId ||
      !productId ||
      !productName ||
      !productBrand ||
      !mainImage ||
      !price ||
      !quantity ||
      !variantColor ||
      !variantSize
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await CartModel.AddToCart(
      userId,
      productId,
      productName,
      productBrand,
      mainImage,
      price,
      quantity,
      variantColor,
      variantSize
    );

    return res.status(201).json({
      message: result.message || "Product added to cart successfully",
      result,
    });
  } catch (err) {
    console.error("Add Cart error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Update cart quantity
exports.updateCartQuantity = async (req, res) => {
  const { userId, productId, variantColor, variantSize, quantity } = req.body;

  // Check if any required field is missing
  if (!userId || !productId || !variantColor || !variantSize || !quantity) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const result = await CartModel.UpdateCartQuantity(
      userId,
      productId,
      variantColor,
      variantSize,
      quantity
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res.status(200).json({ message: "Cart quantity updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { userId, productId, variantColor, variantSize } = req.body;

  // Check if any required field is missing
  if (!userId || !productId || !variantColor || !variantSize) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const result = await CartModel.RemoveFromCart(
      userId,
      productId,
      variantColor,
      variantSize
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    res
      .status(200)
      .json({ message: "Product removed from cart successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
