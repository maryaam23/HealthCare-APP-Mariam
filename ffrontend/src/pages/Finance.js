import { useState, useEffect } from "react";
import api from "../api";

export default function Finance({ token }) {
    const [filters, setFilters] = useState({
        doctorName: "",
        patientName: "",
        visitId: "",
        status: "",
        sortBy: "", // new field for sorting
    });
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch visits whenever filters change
    useEffect(() => {
        const fetchVisits = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.doctorName) params.append("doctorName", filters.doctorName);
                if (filters.patientName) params.append("patientName", filters.patientName);
                if (filters.visitId) params.append("visitId", filters.visitId);
                if (filters.status) params.append("status", filters.status);
                if (filters.sortBy) params.append("sortBy", filters.sortBy);

                const res = await api.get(`/finance/visits?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }

                });
                setVisits(res.data);
            } catch (err) {
                alert(err.response?.data?.msg || "Failed to fetch visits");
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
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

    // Calculate total sum of all visit totalAmount values
    const totalSum = visits.reduce((sum, visit) => sum + (visit.totalAmount || 0), 0);

    return (
        <div
            style={{
                fontFamily: "'Poppins', sans-serif",
                background: "linear-gradient(to right, #edf4faff, #e8f4ffff)",
                minHeight: "100vh",
                padding: "30px 20px",
                maxWidth: 1500,
                margin: "0 auto",
            }}
        >
            <h2
                style={{
                    color: "#1976d2",
                    fontWeight: 600,
                    fontSize: 28,
                    marginBottom: 25,
                    textAlign: "center",
                    textShadow: "1px 1px 3px rgba(25, 118, 210, 0.3)",
                }}
            >
                Finance Dashboard - Visits
            </h2>

            {/* Filters Title */}
            <p
                style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#1976d2",
                    marginBottom: 10,
                    textAlign: "center",
                    userSelect: "none",
                }}
            >
                Filter Visits
            </p>

            {/* Filter Form */}
            <form
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 15,
                    marginBottom: 25,
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.9)",
                    padding: 20,
                    borderRadius: 16,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                }}
            >
                {["doctorName", "patientName", "visitId"].map((field) => (
                    <input
                        key={field}
                        type="text"
                        name={field}
                        placeholder={field === "visitId" ? "Visit ID" : `${field.replace("Name", " Name")}`}
                        value={filters[field]}
                        onChange={handleInputChange}
                        style={{
                            flex: "1 1 200px",
                            padding: "10px 14px",
                            fontSize: 16,
                            borderRadius: 12,
                            border: "1.5px solid #1976d2",
                            outline: "none",
                            transition: "border-color 0.3s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#1565c0")}
                        onBlur={(e) => (e.target.style.borderColor = "#1976d2")}
                    />
                ))}

                <select
                    name="status"
                    value={filters.status}
                    onChange={handleInputChange}
                    style={{
                        flex: "1 1 200px",
                        padding: "10px 14px",
                        fontSize: 16,
                        borderRadius: 12,
                        border: "1.5px solid #1976d2",
                        outline: "none",
                        transition: "border-color 0.3s",
                        backgroundColor: "white",
                        cursor: "pointer",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1565c0")}
                    onBlur={(e) => (e.target.style.borderColor = "#1976d2")}
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>

                {/* New Sort By Select */}
                <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleInputChange}
                    style={{
                        flex: "1 1 220px",
                        padding: "10px 14px",
                        fontSize: 16,
                        borderRadius: 12,
                        border: "1.5px solid #1976d2",
                        outline: "none",
                        transition: "border-color 0.3s",
                        backgroundColor: "white",
                        cursor: "pointer",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1565c0")}
                    onBlur={(e) => (e.target.style.borderColor = "#1976d2")}
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
                        padding: "10px 30px",
                        fontSize: 16,
                        fontWeight: "600",
                        borderRadius: 14,
                        border: "none",
                        backgroundColor: "#e53935",
                        color: "white",
                        cursor: "pointer",
                        boxShadow: "0 6px 15px rgba(229, 57, 53, 0.6)",
                        transition: "background-color 0.3s",
                        marginLeft: 10,
                        alignSelf: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b71c1c")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e53935")}
                >
                    Reset
                </button>
            </form>

            {/* Content */}
            {loading ? (
                <p
                    style={{
                        textAlign: "center",
                        fontSize: 18,
                        color: "#1976d2",
                        fontWeight: 600,
                    }}
                >
                    Loading visits...
                </p>
            ) : visits.length === 0 ? (
                <p
                    style={{
                        textAlign: "center",
                        fontSize: 18,
                        color: "#e53935",
                        fontWeight: 600,
                    }}
                >
                    No visits found.
                </p>
            ) : (
                <>
                    <div
                        style={{
                            overflowX: "auto",
                            background: "rgba(255,255,255,0.95)",
                            borderRadius: 16,
                            padding: 20,
                            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "separate",
                                borderSpacing: "0 12px",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: "#1976d2",
                                        color: "white",
                                        textAlign: "left",
                                        borderRadius: "16px",
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
                                        "Paid", // new header here
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            style={{
                                                padding: "12px 15px",
                                                fontWeight: "600",
                                                fontSize: 14,
                                                letterSpacing: "0.05em",
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
                                            backgroundColor: "#f7f9fc",
                                            borderRadius: 12,
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "15px",
                                                fontSize: 13,
                                                fontWeight: "500",
                                                color: "#1976d2",
                                                maxWidth: 150,
                                                wordBreak: "break-word",
                                            }}
                                        >
                                            {visit._id}
                                        </td>
                                        <td style={{ padding: "15px", fontSize: 14, fontWeight: "500" }}>
                                            {visit.doctor.name}
                                        </td>
                                        <td style={{ padding: "15px", fontSize: 14, fontWeight: "500" }}>
                                            {visit.patient.name}
                                        </td>
                                        <td
                                            style={{ padding: "15px", fontSize: 14, fontWeight: "600", color: "#1976d2" }}
                                        >
                                            {new Intl.DateTimeFormat("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            }).format(new Date(visit.date))}
                                            <span style={{ marginLeft: 7 }}>
                                                {visit.time.length === 5 ? visit.time : visit.time.padStart(5, "0")}
                                            </span>
                                        </td>

                                        <td style={{ padding: "15px", fontSize: 14, fontStyle: "italic", color: "#555" }}>
                                            {visit.problem || "-"}
                                        </td>
                                        <td style={{ padding: "15px", fontSize: 14 }}>
                                            {visit.treatments.length === 0
                                                ? "-"
                                                : visit.treatments.map((t, i) => (
                                                    <div key={i} style={{ marginBottom: 4, color: "#333", fontWeight: 500 }}>
                                                        {t.name}: ${t.cost.toFixed(2)}
                                                    </div>
                                                ))}
                                        </td>
                                        <td
                                            style={{
                                                padding: "15px",
                                                fontWeight: "600",
                                                color: "#1976d2",
                                                fontSize: 14,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            ${visit.totalAmount?.toFixed(2) || "0.00"}
                                        </td>
                                        <td
                                            style={{
                                                padding: "15px",
                                                fontWeight: "600",
                                                color:
                                                    visit.status === "completed"
                                                        ? "#4caf50"
                                                        : visit.status === "in-progress"
                                                            ? "#ff9800"
                                                            : "#e53935",
                                                textTransform: "capitalize",
                                                fontSize: 14,
                                            }}
                                        >
                                            {visit.status}
                                        </td>

                                        {/* Paid checkbox column */}
                                        <td
                                            style={{
                                                padding: "15px",
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
                                                                    Authorization: `Bearer ${token}`,  // add Bearer if backend expects it
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
                                                        alert(error.response?.data?.msg || "Failed to update payment status");
                                                    }
                                                }}

                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div
                        style={{
                            marginTop: 20,
                            padding: "20px 30px",
                            backgroundColor: "white",
                            borderRadius: 16,
                            boxShadow: "0 6px 18px rgba(25, 118, 210, 0.15)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            maxWidth: 500,
                            marginLeft: "auto",
                            marginRight: "auto",
                            userSelect: "none",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span
                                role="img"
                                aria-label="visits"
                                style={{
                                    fontSize: 28,
                                    color: "#1976d2",
                                }}
                            >
                                📅
                            </span>
                            <div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: "700",
                                        color: "#1976d2",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    {visits.length}
                                </div>
                                <div style={{ fontSize: 14, color: "#555" }}>Total Visits</div>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span
                                role="img"
                                aria-label="amount"
                                style={{
                                    fontSize: 28,
                                    color: "#4caf50",
                                }}
                            >
                                💰
                            </span>
                            <div>
                                <div
                                    style={{
                                        fontSize: 20,
                                        fontWeight: "700",
                                        color: "#4caf50",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    ${totalSum.toFixed(2)}
                                </div>
                                <div style={{ fontSize: 14, color: "#555" }}>Total Amount</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
