
const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const allowedSlots = [
    "Morning fasting",
    "After breakfast",
    "After lunch",
    "After dinner"
];

const isValidDate = (date) => {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

const isFutureDate = (date) => {
    const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });

    return date > today;
};

const validateReading = (reading_date, slot, value) => {
    if (!reading_date || !slot || value === undefined) {
        return "Date, slot and glucose value are required";
    }

    if (!isValidDate(reading_date)) {
        return "Invalid date. Use YYYY-MM-DD format";
    }

    if (isFutureDate(reading_date)) {
        return "Future dates are not allowed";
    }

    if (!allowedSlots.includes(slot)) {
        return "Invalid reading slot";
    }

    if (!Number.isInteger(value) || value < 40 || value > 600) {
        return "Glucose value must be an integer between 40 and 600";
    }

    return null;
};

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { reading_date, slot, value } = req.body;

        const validationError = validateReading(
            reading_date,
            slot,
            value
        );

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const result = await pool.query(
            `INSERT INTO glucose_readings
             (user_id, reading_date, slot, value)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, reading_date, slot, value]
        );

        return res.status(201).json({
            message: "Glucose reading added successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this date and slot"
            });
        }

        console.error("Add reading error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, reading_date, slot, value, created_at
             FROM glucose_readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            message: "Glucose readings fetched successfully",
            count: result.rows.length,
            readings: result.rows
        });

    } catch (error) {
        console.error("Get readings error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid reading ID"
            });
        }

        const result = await pool.query(
            `SELECT id, user_id, reading_date, slot, value, created_at
             FROM glucose_readings
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Glucose reading not found"
            });
        }

        return res.status(200).json({
            message: "Glucose reading fetched successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Get reading by ID error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { reading_date, slot, value } = req.body;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid reading ID"
            });
        }

        const validationError = validateReading(
            reading_date,
            slot,
            value
        );

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const result = await pool.query(
            `UPDATE glucose_readings
             SET reading_date = $1,
                 slot = $2,
                 value = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [reading_date, slot, value, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Glucose reading not found"
            });
        }

        return res.status(200).json({
            message: "Glucose reading updated successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this date and slot"
            });
        }

        console.error("Update reading error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid reading ID"
            });
        }

        const result = await pool.query(
            `DELETE FROM glucose_readings
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Glucose reading not found"
            });
        }

        return res.status(200).json({
            message: "Glucose reading deleted successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Delete reading error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;
