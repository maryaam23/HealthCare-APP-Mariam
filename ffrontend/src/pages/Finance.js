import { useState, useEffect } from "react";
import api from "../api";
import { motion } from "framer-motion";







export default function Finance({ token }) {
    const [filters, setFilters] = useState({
        doctorName: "",
        patientName: "",
        visitId: "",
        status: "",
        sortBy: "",
    });
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ type: "", message: "" });
    const isValidVisitId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.doctorName) params.append("doctorName", filters.doctorName);
                if (filters.patientName) params.append("patientName", filters.patientName);
                if (filters.visitId && isValidVisitId(filters.visitId)) {
                    params.append("visitId", filters.visitId);
                }
                if (filters.status) params.append("status", filters.status);
                if (filters.sortBy) params.append("sortBy", filters.sortBy);

                const res = await api.get(`/finance/visits?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setVisits(res.data);
            } catch (err) {
                 showNotification("error", err.response?.data?.msg || "Failed to fetch visits");
            } finally {
                setLoading(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [filters, token]);


    const handleInputChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFilters({
            doctorName: "",
            patientName: "",
            visitId: "",
            status: "",
            sortBy: "",
        });
    };

    const showNotification = (type, message) => {
        setNotification({ type, message });
        // Auto hide after 3 seconds
        setTimeout(() => setNotification({ type: "", message: "" }), 3000);
    };



    // Sum total amounts for completed visits (all, paid, unpaid)
    const completedVisits = visits.filter(v => v.status === "completed");
    const totalCompletedAmount = completedVisits.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    const totalPaidAmount = completedVisits.reduce((sum, v) => sum + ((v.paid && v.totalAmount) || 0), 0);
    const totalUnpaidAmount = completedVisits.reduce((sum, v) => sum + ((!v.paid && v.totalAmount) || 0), 0);
    const totalCancelledCount = visits.filter(v => v.status === "cancelled").length;
    const totalPendingCount = visits.filter(v => v.status === "pending").length;
    const totalSum = visits.reduce((sum, visit) => sum + (visit.totalAmount || 0), 0);
    const totalCompletedCount = visits.filter(v => v.status === "completed").length;


    // Colors & shadows variables
    const primaryColor = "#1E88E5"; // Blue 600
    const primaryHover = "#1565C0"; // Blue 800
    const successColor = "#43A047"; // Green 600
    const warningColor = "#FB8C00"; // Orange 600
    const errorColor = "#E53935"; // Red 600
    const bgGradient = "linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%)";
    const cardBg = "#FFFFFF";
    const borderRadius = 14;

    return (
        <div
            style={{
                fontFamily: "'Poppins', sans-serif",
                background: bgGradient,
                minHeight: "100vh",
                padding: "40px 24px",
                maxWidth: 1500,
                margin: "0 auto",
                color: "#2C3E50",
                userSelect: "none",
            }}
        >
            {/* Notification */}
            {notification.message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        position: "fixed",
                        top: 20,
                        right: 20,
                        background: notification.type === "success" ? "#43A047" : "#E53935",
                        color: "#fff",
                        padding: "12px 20px",
                        borderRadius: 12,
                        boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
                        zIndex: 9999,
                        fontWeight: 500,
                        minWidth: 250,
                        textAlign: "center",
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    {notification.message}
                </motion.div>
            )}

            <h2
                style={{
                    color: primaryColor,
                    fontWeight: 700,
                    fontSize: 32,
                    marginBottom: 32,
                    textAlign: "center",
                    textShadow: "0 2px 6px rgba(30,136,229,0.3)",
                    letterSpacing: "0.06em",
                }}
            >
                Finance Dashboard - Visits
            </h2>

            <p
                style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: primaryColor,
                    marginBottom: 16,
                    textAlign: "center",
                    letterSpacing: "0.04em",
                }}
            >
                Filter Visits
            </p>

            <form
                style={{
                    display: "flex",
                    flexWrap: "nowrap", // no wrapping — keep one line
                    gap: 10,
                    marginBottom: 30,
                    justifyContent: "center",
                    background: cardBg,
                    padding: 20,
                    borderRadius,
                    boxShadow: "0 8px 28px rgba(30, 136, 229, 0.12)",
                    transition: "box-shadow 0.3s ease",
                    overflowX: "auto", // allow horizontal scroll if too narrow
                }}
                onSubmit={(e) => e.preventDefault()}
            >
                {["doctorName", "patientName", "visitId"].map((field) => {
                    const placeholders = {
                        doctorName: "Doctor Name",
                        patientName: "Patient Name",
                        visitId: "Visit ID",
                    };

                    return (
                        <input
                            key={field}
                            type="text"
                            name={field}
                            placeholder={placeholders[field]}
                            value={filters[field]}
                            onChange={handleInputChange}
                            style={{
                                flex: "1 1 240px",
                                padding: "14px 18px",
                                fontSize: 16,
                                borderRadius,
                                border: `2px solid ${primaryColor}`,
                                outline: "none",
                                transition: "all 0.3s ease",
                                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.08)",
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = primaryHover;
                                e.target.style.boxShadow = `0 0 8px ${primaryHover}`;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = primaryColor;
                                e.target.style.boxShadow = "inset 0 1px 4px rgba(0,0,0,0.08)";
                            }}
                        />
                    );
                })}

                <select
                    name="status"
                    value={filters.status}
                    onChange={handleInputChange}
                    style={{
                        flex: "1 1 220px",
                        padding: "14px 18px",
                        fontSize: 16,
                        borderRadius,
                        border: `2px solid ${primaryColor}`,
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.08)",
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = primaryHover;
                        e.target.style.boxShadow = `0 0 8px ${primaryHover}`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = "inset 0 1px 4px rgba(0,0,0,0.08)";
                    }}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option> {/* Added */}
                </select>


                <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleInputChange}
                    style={{
                        flex: "1 1 260px",
                        padding: "14px 18px",
                        fontSize: 16,
                        borderRadius,
                        border: `2px solid ${primaryColor}`,
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.08)",
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = primaryHover;
                        e.target.style.boxShadow = `0 0 8px ${primaryHover}`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = primaryColor;
                        e.target.style.boxShadow = "inset 0 1px 4px rgba(0,0,0,0.08)";
                    }}
                >
                    <option value="">Sort By (None)</option>
                    <option value="date_asc">Date Ascending</option>
                    <option value="date_desc">Date Descending</option>
                    <option value="time_asc">Time Ascending</option>
                    <option value="time_desc">Time Descending</option>
                    <option value="datetime_asc">Date + Time Ascending</option>
                    <option value="datetime_desc">Date + Time Descending</option>
                </select>

                <button
                    type="button"
                    onClick={handleReset}
                    style={{
                        padding: "14px 36px",
                        fontSize: 16,
                        fontWeight: "700",
                        borderRadius,
                        border: "none",
                        backgroundColor: errorColor,
                        color: "white",
                        cursor: "pointer",
                        boxShadow: `0 6px 18px rgba(229, 57, 53, 0.6)`,
                        transition: "background-color 0.3s ease, transform 0.2s ease",
                        alignSelf: "center",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#b71c1c";
                        e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = errorColor;
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                >
                    Reset
                </button>
            </form>

            {loading ? (
                <p
                    style={{
                        textAlign: "center",
                        fontSize: 20,
                        color: primaryColor,
                        fontWeight: 700,
                        marginTop: 40,
                    }}
                >
                    Loading visits...
                </p>
            ) : visits.length === 0 ? (
                <p
                    style={{
                        textAlign: "center",
                        fontSize: 20,
                        color: errorColor,
                        fontWeight: 700,
                        marginTop: 40,
                    }}
                >
                    No visits found.
                </p>
            ) : (
                <>
                    <div
                        style={{
                            overflowX: "auto",
                            background: cardBg,
                            borderRadius,
                            padding: 20,
                            boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "separate",
                                borderSpacing: "0 14px",
                                minWidth: 900,
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: primaryColor,
                                        color: "white",
                                        textAlign: "left",
                                        fontWeight: 700,
                                        fontSize: 15,
                                        letterSpacing: "0.06em",
                                        userSelect: "none",
                                        borderRadius,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    }}
                                >
                                    {[
                                        "Visit ID",
                                        "Doctor",
                                        "Patient",
                                        "Date & Time",
                                        "Problem",
                                        "Treatments (name: cost)",
                                        "Total Amount",
                                        "Status",
                                        "Paid",
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            style={{
                                                padding: "14px 18px",
                                                borderBottom: "none",
                                                userSelect: "none",
                                            }}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visits.map((visit) => (
                                    <tr
                                        key={visit._id}
                                        style={{
                                            backgroundColor: "#fefefe",
                                            borderRadius,
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                                            transition: "background-color 0.2s ease",
                                            cursor: "default",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f1f7ff";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "#fefefe";
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "16px 12px",
                                                fontSize: 14,
                                                fontWeight: 600,
                                                color: primaryColor,
                                                maxWidth: 200,
                                                wordBreak: "break-word",
                                                userSelect: "text",
                                            }}
                                            title={visit._id}
                                        >
                                            {visit._id}
                                        </td>
                                        <td style={{ padding: "16px 18px", fontSize: 15, fontWeight: 600 }}>
                                            {visit.doctor.name}
                                        </td>
                                        <td style={{ padding: "16px 18px", fontSize: 15, fontWeight: 600 }}>
                                            {visit.patient.name}
                                        </td>
                                        <td
                                            style={{ padding: "16px 18px", fontSize: 14, fontWeight: 600, color: primaryColor }}
                                        >
                                            {new Intl.DateTimeFormat("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }).format(new Date(visit.date))}
                                            <span style={{ marginLeft: 8, fontWeight: 500, color: "#444" }}>
                                                {visit.time.length === 5 ? visit.time : visit.time.padStart(5, "0")}
                                            </span>
                                        </td>

                                        <td
                                            style={{
                                                padding: "16px 18px",
                                                fontSize: 14,
                                                fontStyle: "italic",
                                                color: "#666",
                                                maxWidth: 180,
                                                whiteSpace: "break-spaces",
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {visit.problem || "-"}
                                        </td>
                                        <td style={{ padding: "16px 18px", fontSize: 14, fontWeight: 500, color: "#333" }}>
                                            {visit.treatments.length === 0
                                                ? "-"
                                                : visit.treatments.map((t, i) => (
                                                    <div key={i} style={{ marginBottom: 4 }}>
                                                        {t.name}: ${t.cost.toFixed(2)}
                                                    </div>
                                                ))}
                                        </td>
                                        <td
                                            style={{
                                                padding: "16px 18px",
                                                fontWeight: 700,
                                                color: primaryColor,
                                                fontSize: 15,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            ${visit.totalAmount?.toFixed(2) || "0.00"}
                                        </td>
                                        <td
                                            style={{
                                                padding: "16px 18px",
                                                fontWeight: 700,
                                                color:
                                                    visit.status === "completed"
                                                        ? successColor
                                                        : visit.status === "in-progress"
                                                            ? warningColor
                                                            : errorColor,
                                                textTransform: "capitalize",
                                                fontSize: 15,
                                                userSelect: "none",
                                            }}
                                        >
                                            {visit.status}
                                        </td>

                                        <td
                                            style={{
                                                padding: "16px 18px",
                                                fontSize: 14,
                                                textAlign: "center",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={visit.paid}
                                                disabled={visit.status !== "completed"}
                                                onChange={async (e) => {
                                                    const newPaidStatus = e.target.checked;
                                                    try {
                                                        await api.patch(
                                                            `/finance/update-paid/${visit._id}`,
                                                            { paid: newPaidStatus },
                                                            {
                                                                headers: {
                                                                    Authorization: `Bearer ${token}`,
                                                                    "Content-Type": "application/json",
                                                                },
                                                            }
                                                        );
                                                        setVisits((prev) =>
                                                            prev.map((v) =>
                                                                v._id === visit._id ? { ...v, paid: newPaidStatus } : v
                                                            )
                                                        );
                                                    } catch (error) {
                                                        showNotification("error", error.response?.data?.msg || "Failed to update payment status");
                                                    }
                                                }}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    cursor: visit.status === "completed" ? "pointer" : "not-allowed",
                                                    accentColor: successColor,
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>




                    <div
                        style={{
                            marginTop: 30,
                            padding: "24px 36px",
                            backgroundColor: cardBg,
                            borderRadius,
                            boxShadow: `0 8px 28px rgba(30,136,229,0.1)`,
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            maxWidth: 1500,
                            marginLeft: "auto",
                            marginRight: "auto",
                            userSelect: "none",
                            gap: 40,
                            flexWrap: "wrap",
                            marginBottom: 50,

                        }}
                    >


                        {/* Completed total */}

                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span
                                role="img"
                                aria-label="visits"
                                style={{
                                    fontSize: 28,
                                    color: primaryColor,
                                }}
                            >
                                📅
                            </span>
                            <div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        color: primaryColor,
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {visits.length}
                                </div>
                                <div style={{ fontSize: 14, color: "#666" }}>Total Visits</div>
                            </div>
                        </div>



                        {/* Pending amount */}
                        {/* Pending count */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span
                                role="img"
                                aria-label="pending"
                                style={{ fontSize: 28, color: warningColor }}
                            >
                                ⏳
                            </span>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: warningColor, lineHeight: 1.1 }}>
                                    {totalPendingCount}
                                </div>
                                <div style={{ fontSize: 14, color: "#666" }}>Pending Visits</div>
                            </div>
                        </div>
                        {/* Cancelled Visits */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span
                                role="img"
                                aria-label="cancelled"
                                style={{ fontSize: 28, color: errorColor }}
                            >
                                ❌
                            </span>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: errorColor, lineHeight: 1.1 }}>
                                    {totalCancelledCount}
                                </div>
                                <div style={{ fontSize: 14, color: "#666" }}>Cancelled Visits</div>
                            </div>
                        </div>
                        {/* Completed Visits Count */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span
                                role="img"
                                aria-label="completed visits"
                                style={{ fontSize: 28, color: successColor }}
                            >
                                ✅
                            </span>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: successColor, lineHeight: 1.1 }}>
                                    {totalCompletedCount}
                                </div>
                                <div style={{ fontSize: 14, color: "#666" }}>Completed Visits</div>
                            </div>
                        </div>


                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span
                                role="img"
                                aria-label="completed"
                                style={{ fontSize: 28, color: primaryColor }}
                            >
                                ✅
                            </span>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: primaryColor, lineHeight: 1.1 }}>
                                    ${totalCompletedAmount.toFixed(2)}
                                </div>
                                <div style={{ fontSize: 14, color: "#666" }}>Completed (All)</div>
                            </div>
                        </div>

                        {/* Paid amount */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span
                                role="img"
                                aria-label="paid"
                                style={{ fontSize: 28, color: successColor }}
                            >
                                💵
                            </span>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: successColor, lineHeight: 1.1 }}>
                                    ${totalPaidAmount.toFixed(2)}
                                </div>
                                <div style={{ fontSize: 14, color: "#666" }}>Paid</div>
                            </div>
                        </div>

                        {/* Unpaid amount */}
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <span
                                role="img"
                                aria-label="unpaid"
                                style={{ fontSize: 28, color: warningColor }}
                            >
                                🕓
                            </span>
                            <div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: warningColor, lineHeight: 1.1 }}>
                                    ${totalUnpaidAmount.toFixed(2)}
                                </div>
                                <div style={{ fontSize: 14, color: "#666" }}>Unpaid</div>
                            </div>
                        </div>



                    </div>

                </>
            )}
        </div>
    );
}
