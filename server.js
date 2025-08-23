const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const addressRoutes = require("./routes/addressRoutes");
const errorHandler = require("./middleware/errorHandler");
const addproductRoutes = require("./routes/addproductRoutes");
const AdminuserRoutes = require("./routes/AdminuserRoutes");
const CartRoutes = require("./routes/CartRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middleware
// const cors = require("cors");
app.use(
  cors({
    origin: [
      "https://eelectromart.netlify.app",
      "https://electromart-admin.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/p_image", express.static("p_image"));

// Routes
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
