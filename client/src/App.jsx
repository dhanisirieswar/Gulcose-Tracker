
import { useState } from "react";
import "./App.css";

function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignup, setIsSignup] = useState(false);

    const [readings, setReadings] = useState([]);

    const today = new Date().toLocaleDateString("en-CA");

    const [readingDate, setReadingDate] = useState(today);
    const [slot, setSlot] = useState("Morning fasting");
    const [value, setValue] = useState("");

    const [reportDate, setReportDate] = useState(today);
    const [dailyReport, setDailyReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    const [monthToDateDate, setMonthToDateDate] = useState(today);
    const [monthToDateReport, setMonthToDateReport] = useState(null);
    const [monthToDateLoading, setMonthToDateLoading] = useState(false);

    const [previousMonthReport, setPreviousMonthReport] = useState(null);
    const [previousMonthLoading, setPreviousMonthLoading] = useState(false);

    const todayReadings = readings.filter(
        (reading) => String(reading.reading_date).slice(0, 10) === today
    );

    const numericReadings = readings
        .map((reading) => Number(reading.value))
        .filter((readingValue) => Number.isFinite(readingValue));

    const todayAverage = todayReadings.length > 0
        ? (
            todayReadings.reduce(
                (total, reading) => total + Number(reading.value),
                0
            ) / todayReadings.length
        ).toFixed(1)
        : "N/A";

    const highestReading = numericReadings.length > 0
        ? Math.max(...numericReadings)
        : "N/A";

    const lowestReading = numericReadings.length > 0
        ? Math.min(...numericReadings)
        : "N/A";

    const fetchReadings = async (token) => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/readings",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setReadings(data.readings);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Unable to fetch readings");
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                setIsLoggedIn(true);
                await fetchReadings(data.token);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Server connection error");
        }
    };

    const handleSignup = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Signup successful! Please login.");
                setIsSignup(false);
                setName("");
                setEmail("");
                setPassword("");
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Server connection error");
        }
    };

    const handleAddReading = async (event) => {
        event.preventDefault();

        const numericValue = Number(value);

        if (
            !Number.isInteger(numericValue) ||
            numericValue < 40 ||
            numericValue > 600
        ) {
            alert("Enter a whole number between 40 and 600.");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                "http://localhost:5000/api/readings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reading_date: readingDate,
                        slot,
                        value: numericValue
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert("Reading added successfully!");
                setValue("");
                await fetchReadings(token);
                setDailyReport(null);
                setMonthToDateReport(null);
                setPreviousMonthReport(null);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Server connection error");
        }
    };

    const handleDeleteReading = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this reading?"
        );

        if (!confirmDelete) return;

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:5000/api/readings/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setReadings((previousReadings) =>
                    previousReadings.filter(
                        (reading) => reading.id !== id
                    )
                );

                setDailyReport(null);
                setMonthToDateReport(null);
                setPreviousMonthReport(null);

                alert("Reading deleted successfully!");
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Server connection error");
        }
    };

    const handleEditReading = async (reading) => {
        const updatedValue = window.prompt(
            "Enter the updated glucose value:",
            reading.value
        );

        if (updatedValue === null) return;

        const numericValue = Number(updatedValue);

        if (
            !Number.isInteger(numericValue) ||
            numericValue < 40 ||
            numericValue > 600
        ) {
            alert("Enter a whole number between 40 and 600.");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `http://localhost:5000/api/readings/${reading.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        reading_date: String(reading.reading_date).slice(0, 10),
                        slot: reading.slot,
                        value: numericValue
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                await fetchReadings(token);
                setDailyReport(null);
                setMonthToDateReport(null);
                setPreviousMonthReport(null);
                alert("Reading updated successfully!");
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Server connection error");
        }
    };

    const handleDailyReport = async () => {
        if (!reportDate) {
            alert("Please select a date.");
            return;
        }

        const token = localStorage.getItem("token");

        setReportLoading(true);
        setDailyReport(null);

        try {
            const response = await fetch(
                `http://localhost:5000/api/reports/daily?date=${reportDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setDailyReport(data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Unable to fetch daily report");
        } finally {
            setReportLoading(false);
        }
    };

    const handleMonthToDateReport = async () => {
        if (!monthToDateDate) {
            alert("Please select a date.");
            return;
        }

        const token = localStorage.getItem("token");

        setMonthToDateLoading(true);
        setMonthToDateReport(null);

        try {
            const response = await fetch(
                `http://localhost:5000/api/reports/month-to-date?date=${monthToDateDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMonthToDateReport(data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Unable to fetch month-to-date report");
        } finally {
            setMonthToDateLoading(false);
        }
    };

    const handlePreviousMonthReport = async () => {
        const token = localStorage.getItem("token");

        setPreviousMonthLoading(true);
        setPreviousMonthReport(null);

        try {
            const response = await fetch(
                "http://localhost:5000/api/reports/previous-month",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setPreviousMonthReport(data);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Unable to fetch previous month report");
        } finally {
            setPreviousMonthLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");

        setIsLoggedIn(false);
        setReadings([]);
        setDailyReport(null);
        setMonthToDateReport(null);
        setPreviousMonthReport(null);

        setEmail("");
        setPassword("");
        setName("");
        setValue("");
    };

    const renderStatistics = (statistics) => (
        <div className="report-statistics">
            <div>
                <h4>Highest</h4>
                <p>
                    {statistics.highest !== null
                        ? `${statistics.highest} mg/dL`
                        : "N/A"}
                </p>
            </div>

            <div>
                <h4>Lowest</h4>
                <p>
                    {statistics.lowest !== null
                        ? `${statistics.lowest} mg/dL`
                        : "N/A"}
                </p>
            </div>

            <div>
                <h4>Average</h4>
                <p>
                    {statistics.average !== null
                        ? `${statistics.average} mg/dL`
                        : "N/A"}
                </p>
            </div>

            <div>
                <h4>Total Readings</h4>
                <p>{statistics.count}</p>
            </div>
        </div>
    );

    const renderReportReadings = (reportReadings) => (
        reportReadings.length > 0 ? (
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reading Slot</th>
                            <th>Glucose Value (mg/dL)</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reportReadings.map((reading, index) => (
                            <tr key={reading.id || index}>
                                <td>
                                    {reading.reading_date
                                        ? String(reading.reading_date).slice(0, 10)
                                        : "Selected date"}
                                </td>
                                <td>{reading.slot}</td>
                                <td>{reading.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p>No glucose readings found for this period.</p>
        )
    );

    return (
        <div>
            {!isLoggedIn ? (
                <div className="login-container">
                    <h1>Sweety Glucose Tracker</h1>

                    {isSignup ? (
                        <>
                            <h2>Create Account</h2>
                            <p>Register to track your glucose readings</p>

                            <form onSubmit={handleSignup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(event) =>
                                        setName(event.target.value)
                                    }
                                    required
                                />

                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    required
                                />

                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                />

                                <button type="submit">Sign Up</button>
                            </form>

                            <p>
                                Already have an account?{" "}
                                <span
                                    onClick={() => {
                                        setIsSignup(false);
                                        setName("");
                                        setPassword("");
                                    }}
                                    style={{
                                        color: "#416B94",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                    }}
                                >
                                    Login
                                </span>
                            </p>
                        </>
                    ) : (
                        <>
                            <h2>Welcome Back!</h2>
                            <p>Login to manage your glucose readings</p>

                            <form onSubmit={handleLogin}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    required
                                />

                                <label>Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                />

                                <button type="submit">Login</button>
                            </form>

                            <p>
                                Don't have an account?{" "}
                                <span
                                    onClick={() => {
                                        setIsSignup(true);
                                        setEmail("");
                                        setPassword("");
                                    }}
                                    style={{
                                        color: "#416B94",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                    }}
                                >
                                    Sign Up
                                </span>
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="dashboard-container">
                    <h1>Sweety Glucose Tracker</h1>

                    <h2>Dashboard</h2>
                    <p>Track and manage your blood glucose readings.</p>

                    <div className="dashboard-summary-grid">
                        <div className="summary-card summary-total">
                            <span className="summary-icon">📋</span>
                            <h4>Total Readings</h4>
                            <p>{readings.length}</p>
                            <span className="summary-caption">
                                All saved readings
                            </span>
                        </div>

                        <div className="summary-card summary-average">
                            <span className="summary-icon">📊</span>
                            <h4>Today's Average</h4>
                            <p>
                                {todayAverage === "N/A"
                                    ? "N/A"
                                    : `${todayAverage} mg/dL`}
                            </p>
                            <span className="summary-caption">
                                Based on today's readings
                            </span>
                        </div>

                        <div className="summary-card summary-high">
                            <span className="summary-icon">↗️</span>
                            <h4>Highest Recorded</h4>
                            <p>
                                {highestReading === "N/A"
                                    ? "N/A"
                                    : `${highestReading} mg/dL`}
                            </p>
                            <span className="summary-caption">
                                Across all saved readings
                            </span>
                        </div>

                        <div className="summary-card summary-low">
                            <span className="summary-icon">↘️</span>
                            <h4>Lowest Recorded</h4>
                            <p>
                                {lowestReading === "N/A"
                                    ? "N/A"
                                    : `${lowestReading} mg/dL`}
                            </p>
                            <span className="summary-caption">
                                Across all saved readings
                            </span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                    <h2>Add Glucose Reading</h2>

                    <form onSubmit={handleAddReading}>
                        <label>Date</label>
                        <input
                            type="date"
                            value={readingDate}
                            max={today}
                            onChange={(event) =>
                                setReadingDate(event.target.value)
                            }
                            required
                        />

                        <label>Reading Slot</label>
                        <select
                            value={slot}
                            onChange={(event) =>
                                setSlot(event.target.value)
                            }
                            required
                        >
                            <option value="Morning fasting">Morning fasting</option>
                            <option value="After breakfast">After breakfast</option>
                            <option value="After lunch">After lunch</option>
                            <option value="After dinner">After dinner</option>
                        </select>

                        <label>Glucose Value (mg/dL)</label>
                        <input
                            type="number"
                            placeholder="Enter glucose value"
                            min="40"
                            max="600"
                            step="1"
                            value={value}
                            onChange={(event) =>
                                setValue(event.target.value)
                            }
                            required
                        />

                        <button type="submit">Add Reading</button>
                    </form>

                    <h2>Daily Glucose Report</h2>

                    <div className="daily-report-section">
                        <label>Select Date</label>
                        <input
                            type="date"
                            value={reportDate}
                            max={today}
                            onChange={(event) => {
                                setReportDate(event.target.value);
                                setDailyReport(null);
                            }}
                        />

                        <button
                            type="button"
                            onClick={handleDailyReport}
                            disabled={reportLoading}
                        >
                            {reportLoading
                                ? "Loading..."
                                : "Generate Daily Report"}
                        </button>
                    </div>

                    {dailyReport && (
                        <div className="daily-report-results">
                            <h3>Daily Report: {dailyReport.date}</h3>
                            {renderStatistics(dailyReport.statistics)}
                            <h3>Reading Details</h3>
                            {renderReportReadings(dailyReport.readings)}
                        </div>
                    )}

                    <h2>Month-to-Date Glucose Report</h2>

                    <div className="daily-report-section">
                        <p>
                            View readings from the first day of the selected
                            month through your selected date.
                        </p>

                        <label>Select Date</label>
                        <input
                            type="date"
                            value={monthToDateDate}
                            max={today}
                            onChange={(event) => {
                                setMonthToDateDate(event.target.value);
                                setMonthToDateReport(null);
                            }}
                        />

                        <button
                            type="button"
                            onClick={handleMonthToDateReport}
                            disabled={monthToDateLoading}
                        >
                            {monthToDateLoading
                                ? "Loading..."
                                : "Generate Month-to-Date Report"}
                        </button>
                    </div>

                    {monthToDateReport && (
                        <div className="daily-report-results">
                            <h3>Month-to-Date Report</h3>

                            <p>
                                Period: {monthToDateReport.startDate || monthToDateDate.slice(0, 8) + "01"}
                                {" to "}
                                {monthToDateReport.endDate || monthToDateReport.date || monthToDateDate}
                            </p>

                            {renderStatistics(monthToDateReport.statistics)}

                            <h3>Reading Details</h3>
                            {renderReportReadings(monthToDateReport.readings)}
                        </div>
                    )}

                    <h2>Previous Month Glucose Report</h2>

                    <div className="daily-report-section">
                        <p>
                            View all glucose readings from the previous
                            calendar month.
                        </p>

                        <button
                            type="button"
                            onClick={handlePreviousMonthReport}
                            disabled={previousMonthLoading}
                        >
                            {previousMonthLoading
                                ? "Loading..."
                                : "Generate Previous Month Report"}
                        </button>
                    </div>

                    {previousMonthReport && (
                        <div className="daily-report-results">
                            <h3>Previous Month Report</h3>

                            <p>
                                Period: {previousMonthReport.startDate || "Previous month"}
                                {" to "}
                                {previousMonthReport.endDate || ""}
                            </p>

                            {renderStatistics(previousMonthReport.statistics)}

                            <h3>Reading Details</h3>
                            {renderReportReadings(previousMonthReport.readings)}
                        </div>
                    )}

                    <h2>My Glucose Readings</h2>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reading Slot</th>
                                    <th>Value (mg/dL)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {readings.length > 0 ? (
                                    readings.map((reading) => (
                                        <tr key={reading.id}>
                                            <td>
                                                {String(reading.reading_date).slice(0, 10)}
                                            </td>
                                            <td>{reading.slot}</td>
                                            <td>{reading.value}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditReading(reading)
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteReading(reading.id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">
                                            No glucose readings found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
