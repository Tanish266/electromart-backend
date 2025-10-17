const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const errorHandler = require("./middleware/errorHandler");
const addproductRoutes = require("./routes/addProductRoutes");
const AdminuserRoutes = require("./routes/AdminuserRoutes");
const CartRoutes = require("./routes/CartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const searchRoutes = require("./routes/searchRoute");

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(
  cors({
    origin: "https://eelectromart.netlify.app",
  })
);
// CORS with env-driven origins
const defaultOrigins = [
  "https://eelectromart.netlify.app",
  "https://electromart-admin.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/p_image", express.static("p_image"));

// Routes
app.use("/api", searchRoutes);
app.use("/api", userRoutes);
app.use("/api", addressRoutes);
app.use("/api", addproductRoutes);
app.use("/api", AdminuserRoutes);
app.use("/api", CartRoutes);
app.use("/api", orderRoutes);

// Error handling middleware (after routes)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server.js ke start me add karo
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use(cors());
