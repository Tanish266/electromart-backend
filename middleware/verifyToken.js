const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided." });
  }

  const secretKey = process.env.JWT_SECRET || "your_secret_key";

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res
        .status(401)
        .json({ success: false, message: "Failed to authenticate token." });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
