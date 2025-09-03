const express = require("express");
const router = express.Router();
const db = require("../config/db"); // tumhare DB connection wali file

// Search API
router.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const sql = `
    SELECT id, ProductName, Category, ProductBrand, MainImage, JSON_EXTRACT(price, '$[0]') AS Price
    FROM addproduct
    WHERE ProductName LIKE ? OR Category LIKE ? OR ProductBrand LIKE ?
  `;

  db.query(sql, [`%${q}%`, `%${q}%`, `%${q}%`], (err, results) => {
    if (err) {
      console.error("Search query error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

module.exports = router;
