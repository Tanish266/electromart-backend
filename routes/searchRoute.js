const express = require("express");
const router = express.Router();
const AddProductModel = require("../models/addProductModel");

// search by query string
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q)
      return res.status(400).json({ message: "Search query is required" });

    const sql = `SELECT * FROM addproduct WHERE ProductName LIKE ? OR Category LIKE ?`;
    const values = [`%${q}%`, `%${q}%`];

    AddProductModel.query(sql, values, (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
