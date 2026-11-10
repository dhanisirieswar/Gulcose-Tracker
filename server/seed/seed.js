
require("dotenv").config();

const pool = require("../config/db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
    try {
        const name = "Demo User";
        const email = "demo@sweetytracker.com";
        const password = "Demo@12345";

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING`,
            [name, email, hashedPassword]
        );

        const userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        const userId = userResult.rows[0].id;

        const readings = [
            [1, "Morning fasting", 95],
            [1, "After breakfast", 135],
            [2, "Morning fasting", 100],
            [2, "After lunch", 145],
            [3, "Morning fasting", 90],
            [3, "After dinner", 125]
        ];

        for (const [daysAgo, slot, value] of readings) {
            const readingDate = new Date();
            readingDate.setDate(readingDate.getDate() - daysAgo);

            const formattedDate = [
                readingDate.getFullYear(),
                String(readingDate.getMonth() + 1).padStart(2, "0"),
                String(readingDate.getDate()).padStart(2, "0")
            ].join("-");

            await pool.query(
                `INSERT INTO glucose_readings
                 (user_id, reading_date, slot, value)
                 VALUES ($1, $2::date, $3, $4)
                 ON CONFLICT (user_id, reading_date, slot) DO NOTHING`,
                [userId, formattedDate, slot, value]
            );
        }

        console.log("Seed data inserted successfully!");
        console.log("Demo Email:", email);
        console.log("Demo Password:", password);

    } catch (error) {
        console.error("Seed error:", error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

seedDatabase();
