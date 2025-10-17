const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    console.log("No token provided in request header.");
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
    });
  }

  try {
    if (process.env.NODE_ENV === "development") {
      console.log("Validating token:", token);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (process.env.NODE_ENV === "development") {
      console.log("Token decoded successfully:", decoded);
    }

    next();
  } catch (err) {
    console.error("Token validation error:", err);

    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: "Token has expired.",
      });
    }

    return res.status(400).json({
      success: false,
      error: "Invalid token.",
    });
  }
};
