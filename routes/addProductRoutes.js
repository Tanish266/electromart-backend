const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const addproductController = require("../controllers/addproductController");

router.post("/addproduct", upload, addproductController.addproduct);
router.get("/products", addproductController.getAllProducts);
router.get("/products/:id", addproductController.getProductById);
router.put("/products/:id", upload, addproductController.updateProduct);
router.delete("/products/:id", addproductController.deleteProduct);

module.exports = router;
