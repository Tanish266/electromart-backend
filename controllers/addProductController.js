const AddProductModel = require("../models/addproductModel");
const db = require("../config/db");

// Helper function to parse JSON fields
const parseJSONField = (field, fallback = []) => {
  try {
    if (!field) return fallback;
    const parsed = typeof field === "string" ? JSON.parse(field) : field;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// Add Product Controller
exports.addproduct = async (req, res) => {
  try {
    const {
      ProductName,
      category,
      Unit = 1,
      ProductBrand,
      ProductDescription,
    } = req.body;

    // Basic validation
    if (!ProductName || !category) {
      return res
        .status(400)
        .json({ message: "ProductName and category are required." });
    }

    // Parsing price, discount percentage, and variants
    const price = parseJSONField(req.body.price, [0]).map(Number);
    const discountpercentage = parseJSONField(req.body.discountpercentage, [
      0,
    ]).map(Number);
    const VariantsColor = parseJSONField(req.body.VariantsColor);
    const VariantsSize = parseJSONField(req.body.VariantsSize);

    // Handling images
    const MainImage = req.files?.MainImage?.[0]?.filename || null;
    const ExtraImage = req.files?.ExtraImages?.map((f) => f.filename) || [];

    // Validation for MainImage
    if (!MainImage) {
      return res.status(400).json({ message: "MainImage is required." });
    }

    // Add product to DB
    const result = await AddProductModel.addproduct(
      ProductName,
      Unit,
      ProductBrand !== "undefined" ? ProductBrand : null,
      ProductDescription !== "undefined" ? ProductDescription : null,
      MainImage,
      ExtraImage,
      VariantsColor,
      VariantsSize,
      price,
      discountpercentage,
      category
    );

    return res
      .status(201)
      .json({ message: "Product added successfully", result });
  } catch (err) {
    console.error("Add product error:", err);
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Get all products
exports.getAllProducts = async (_, res) => {
  try {
    const products = await AddProductModel.getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    console.error("Fetch products error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await AddProductModel.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    console.error("Fetch product by ID error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ProductName,
      Unit = 1,
      ProductBrand,
      ProductDescription,
      existingMainImage,
      existingExtraImages,
    } = req.body;

    const category = req.body.category || req.body.Category || null;

    // Helper to parse JSON fields properly
    const price = parseJSONField(req.body.price).map(Number);
    const discountpercentage = parseJSONField(req.body.discountpercentage).map(
      Number
    );
    const VariantsColor = parseJSONField(req.body.VariantsColor);
    const VariantsSize = parseJSONField(req.body.VariantsSize);

    // Handling main and extra images
    const MainImage = req.files?.MainImage?.[0]?.filename || existingMainImage;
    const ExtraImage = req.files?.ExtraImages?.length
      ? req.files.ExtraImages.map((f) => f.filename)
      : parseJSONField(existingExtraImages);

    // Validation
    if (
      !ProductName ||
      !price.length ||
      !ProductDescription ||
      !MainImage ||
      !ExtraImage
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check for valid price format
    if (!Array.isArray(price) || price.some((p) => isNaN(p))) {
      return res.status(400).json({ message: "Invalid price format." });
    }

    // Prepare data for update
    const updatedData = {
      ProductName,
      Unit,
      ProductBrand,
      ProductDescription,
      MainImage,
      ExtraImage,
      VariantsColor,
      VariantsSize,
      price,
      discountpercentage,
      Category: category,
    };

    const result = await AddProductModel.updateProduct(id, updatedData);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({
      message: "Product updated successfully.",
      updatedData,
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const result = await AddProductModel.deleteProduct(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decrease Product Quantity after order is placed
exports.decreaseProductQty = (orderId) => {
  const getOrderItemsQuery = `
    SELECT product_name, qty FROM order_items WHERE order_id = ?
  `;

  db.query(getOrderItemsQuery, [orderId], (err, orderItems) => {
    if (err) {
      console.error("Error fetching order items:", err);
      return;
    }

    // If no order items are found, do nothing
    if (orderItems.length === 0) {
      console.log("No items found for order:", orderId);
      return;
    }

    console.log("Fetched order items:", orderItems);

    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting DB connection:", err);
        return;
      }

      connection.beginTransaction((err) => {
        if (err) {
          console.error("Error starting transaction:", err);
          return;
        }

        // Track all the update promises
        const updateQueries = orderItems.map((item) => {
          return new Promise((resolve, reject) => {
            const getProductQuery =
              "SELECT id, Unit FROM addproduct WHERE ProductName = ?";

            connection.query(
              getProductQuery,
              [item.product_name],
              (err, products) => {
                if (err) {
                  console.error(
                    "Error fetching product:",
                    item.product_name,
                    err
                  );
                  reject("Error fetching product: " + item.product_name);
                  return;
                }

                if (!products || products.length === 0) {
                  console.error("Product not found:", item.product_name);
                  reject("Product not found: " + item.product_name);
                  return;
                }

                const product = products[0];
                const updatedQty = product.Unit - item.qty;

                if (updatedQty < 0) {
                  console.error(
                    "Not enough stock for product:",
                    item.product_name
                  );
                  reject("Not enough stock for product: " + item.product_name);
                  return;
                }

                const updateProductQtyQuery = `
                UPDATE addproduct
                SET Unit = ?
                WHERE id = ?
              `;

                connection.query(
                  updateProductQtyQuery,
                  [updatedQty, product.id],
                  (err) => {
                    if (err) {
                      console.error(
                        "Error updating product quantity:",
                        item.product_name,
                        err
                      );
                      reject(
                        "Error updating product quantity for " +
                          item.product_name
                      );
                    } else {
                      console.log(
                        `Decreased quantity of ${item.product_name} to ${updatedQty}`
                      );
                      resolve();
                    }
                  }
                );
              }
            );
          });
        });

        // Wait for all queries to complete before committing
        Promise.all(updateQueries)
          .then(() => {
            connection.commit((err) => {
              if (err) {
                console.error("Error committing transaction:", err);
                return connection.rollback(() => {
                  connection.release();
                });
              }
              console.log(
                `Decreased product quantities for orderId ${orderId}`
              );
              connection.release();
            });
          })
          .catch((err) => {
            console.error("Error in updating product quantities:", err);
            connection.rollback(() => {
              connection.release();
            });
          });
      });
    });
  });
};
