
const express = require("express");
const cors = require("cors");
const reportRoutes = require("./routes/reportRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Report routes
app.use("/api/reports", reportRoutes);

// Authentication routes
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);

// Glucose reading routes
const readingRoutes = require("./routes/readingRoutes");
app.use("/api/readings", readingRoutes);

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Sweety Glucose Tracker API",
        status: "Running"
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

module.exports = app;
