const express = require("express");
const router = express.Router();
const db = require("../config/db");
const Fuse = require("fuse.js"); // fuzzy search

// 🔎 Search API (with typo tolerance)
router.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ message: "Search query is required" });
  }

  // Pehle saare products DB se nikal lo
  const sql = `
    SELECT id, ProductName, Category, ProductBrand, MainImage, 
           JSON_EXTRACT(price, '$[0]') AS Price
    FROM addproduct
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Search query error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    // ✅ Fuzzy search setup
    const fuse = new Fuse(results, {
      keys: ["ProductName", "Category", "ProductBrand"], // kin fields me search kare
      threshold: 0.4, // jitna chhota value, utna strict match (0.4 ~ balanced)
    });

    // Fuzzy filter
    const filtered = fuse.search(q).map((res) => res.item);

    // Agar fuzzy match empty hai → LIKE fallback (optional)
    if (filtered.length === 0) {
      const likeSql = `
        SELECT id, ProductName, Category, ProductBrand, MainImage, 
               JSON_EXTRACT(price, '$[0]') AS Price
        FROM addproduct
        WHERE ProductName LIKE ? OR Category LIKE ? OR ProductBrand LIKE ?
      `;
      return db.query(
        likeSql,
        [`%${q}%`, `%${q}%`, `%${q}%`],
        (err2, likeResults) => {
          if (err2) {
            console.error("LIKE fallback error:", err2);
            return res
              .status(500)
              .json({ message: "Database error", error: err2 });
          }
          return res.json(likeResults);
        }
      );
    }

    res.json(filtered);
  });
});

module.exports = router;
