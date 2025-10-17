const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const addProductController = require("../controllers/addProductController");

router.post("/addProduct", upload, addProductController.addProduct);
router.get("/products", addProductController.getAllProducts);
router.get("/products/:id", addProductController.getProductById);
router.put("/products/:id", upload, addProductController.updateProduct);
router.delete("/products/:id", addProductController.deleteProduct);

module.exports = router;
