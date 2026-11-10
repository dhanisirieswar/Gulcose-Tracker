require("dotenv").config();
const pool = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await pool.query("SELECT NOW()");
        console.log("PostgreSQL connected successfully!");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
});