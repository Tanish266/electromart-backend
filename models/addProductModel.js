const db = require("../config/db");

const AddProductModel = {
  addProduct: async (
    ProductName,
    Unit,
    ProductBrand,
    ProductDescription,
    MainImage = "",
    ExtraImage = [],
    VariantsColor = null,
    VariantsSize = null,
    Price = null,
    discountpercentage = null,
    Category
  ) => {
    try {
      const query = `INSERT INTO addproduct 
        (ProductName, Unit, ProductBrand, ProductDescription, MainImage, ExtraImage, 
         VariantsColor, VariantsSize, Price, discountpercentage, Category) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        ProductName,
        Unit,
        ProductBrand,
        ProductDescription,
        MainImage,
        JSON.stringify(ExtraImage),
        VariantsColor ? JSON.stringify(VariantsColor) : null,
        VariantsSize ? JSON.stringify(VariantsSize) : null,
        JSON.stringify(Price),
        JSON.stringify(discountpercentage),
        Category,
      ];

      console.log("Final Query Values:", values); // Optionally use a logging package

      const [result] = await db.promise().query(query, values);
      return result;
    } catch (err) {
      console.error("Error adding product:", err);
      throw new Error("Database Error: Unable to add product.");
    }
  },

  getAllProducts: async () => {
    try {
      const query = `SELECT * FROM addproduct`;
      const [rows] = await db.promise().query(query);
      return rows;
    } catch (err) {
      console.error("Error fetching products:", err);
      throw new Error("Database Error: Unable to fetch products.");
    }
  },

  getProductById: async (productId) => {
    try {
      const query = `SELECT * FROM addproduct WHERE id = ?`;
      const [rows] = await db.promise().query(query, [productId]);
      return rows.length ? rows[0] : null;
    } catch (err) {
      console.error("Error fetching product:", err);
      throw new Error("Database Error: Unable to fetch product.");
    }
  },

  updateProduct: async (id, updatedData) => {
    try {
      const {
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
        Category,
      } = updatedData;

      const query = `
        UPDATE addproduct SET 
          ProductName = ?, 
          Unit = ?, 
          ProductBrand = ?, 
          ProductDescription = ?, 
          MainImage = ?, 
          ExtraImage = ?, 
          VariantsColor = ?, 
          VariantsSize = ?, 
          Price = ?, 
          discountpercentage = ?, 
          Category = ? 
        WHERE id = ?
      `;

      const values = [
        ProductName,
        Unit,
        ProductBrand,
        ProductDescription,
        MainImage,
        JSON.stringify(ExtraImage),
        VariantsColor ? JSON.stringify(VariantsColor) : null,
        VariantsSize ? JSON.stringify(VariantsSize) : null,
        JSON.stringify(price),
        JSON.stringify(discountpercentage),
        Category,
        id,
      ];

      console.log("Sending SQL with values:", values);
      const [result] = await db.promise().query(query, values);
      return result;
    } catch (err) {
      console.error("Error updating product:", err);
      throw new Error("Database Error: Unable to update product.");
    }
  },

  deleteProduct: async (id) => {
    try {
      const [result] = await db
        .promise()
        .query("DELETE FROM addproduct WHERE id = ?", [id]);
      return result;
    } catch (err) {
      console.error("Error deleting product:", err);
      throw new Error("Database Error: Unable to delete product.");
    }
  },
};

module.exports = AddProductModel;
