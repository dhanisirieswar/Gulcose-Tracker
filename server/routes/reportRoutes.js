const express = require("express");
const router = express.Router();

const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

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

const getToday = () => {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });
};

const getReport = async (userId, startDate, endDate) => {
    const statisticsResult = await pool.query(
        `SELECT
            COUNT(*)::int AS count,
            MAX(value)::int AS highest,
            MIN(value)::int AS lowest,
            ROUND(AVG(value)::numeric, 1) AS average
         FROM glucose_readings
         WHERE user_id = $1
         AND reading_date >= $2
         AND reading_date <= $3`,
        [userId, startDate, endDate]
    );

    const readingsResult = await pool.query(
        `SELECT id, reading_date, slot, value, created_at
         FROM glucose_readings
         WHERE user_id = $1
         AND reading_date >= $2
         AND reading_date <= $3
         ORDER BY reading_date DESC, created_at DESC`,
        [userId, startDate, endDate]
    );

    const statistics = statisticsResult.rows[0];

    return {
        statistics: {
            highest: statistics.highest === null
                ? null
                : Number(statistics.highest),
            lowest: statistics.lowest === null
                ? null
                : Number(statistics.lowest),
            average: statistics.average === null
                ? null
                : Number(statistics.average),
            count: statistics.count
        },
        readings: readingsResult.rows
    };
};

router.get("/daily", authMiddleware, async (req, res) => {
    try {
        const date = req.query.date;

        if (!isValidDate(date)) {
            return res.status(400).json({
                message: "Provide a valid date in YYYY-MM-DD format"
            });
        }

        if (date > getToday()) {
            return res.status(400).json({
                message: "Future dates are not allowed"
            });
        }

        const report = await getReport(
            req.user.id,
            date,
            date
        );

        return res.status(200).json({
            message: "Daily report fetched successfully",
            date,
            ...report
        });

    } catch (error) {
        console.error("Daily report error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get("/month-to-date", authMiddleware, async (req, res) => {
    try {
        const date = req.query.date;

        if (!isValidDate(date)) {
            return res.status(400).json({
                message: "Provide a valid date in YYYY-MM-DD format"
            });
        }

        if (date > getToday()) {
            return res.status(400).json({
                message: "Future dates are not allowed"
            });
        }

        const startDate = `${date.slice(0, 7)}-01`;

        const report = await getReport(
            req.user.id,
            startDate,
            date
        );

        return res.status(200).json({
            message: "Month-to-date report fetched successfully",
            startDate,
            endDate: date,
            ...report
        });

    } catch (error) {
        console.error("Month-to-date report error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get("/previous-month", authMiddleware, async (req, res) => {
    try {
        const today = getToday();
        const currentYear = Number(today.slice(0, 4));
        const currentMonth = Number(today.slice(5, 7));

        const previousMonthDate = new Date(
            Date.UTC(currentYear, currentMonth - 2, 1)
        );

        const previousYear = previousMonthDate.getUTCFullYear();
        const previousMonth = String(
            previousMonthDate.getUTCMonth() + 1
        ).padStart(2, "0");

        const startDate = `${previousYear}-${previousMonth}-01`;

        const lastDay = new Date(
            Date.UTC(previousYear, previousMonthDate.getUTCMonth() + 1, 0)
        ).getUTCDate();

        const endDate = `${previousYear}-${previousMonth}-${String(lastDay).padStart(2, "0")}`;

        const report = await getReport(
            req.user.id,
            startDate,
            endDate
        );

        return res.status(200).json({
            message: "Previous-month report fetched successfully",
            startDate,
            endDate,
            ...report
        });

    } catch (error) {
        console.error("Previous-month report error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;