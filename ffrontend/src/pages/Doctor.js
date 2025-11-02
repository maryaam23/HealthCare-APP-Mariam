
import { motion } from "framer-motion";
import { FaUserMd, FaCalendarAlt, FaStethoscope, FaSignOutAlt } from "react-icons/fa";
import api from "../api";
import { useState, useEffect, useRef } from "react";



//Frontend/ → React (user interface for doctors, patients, and finance)


// Utility: get all days in a month
const getDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export default function Doctor({ token }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitId, setVisitId] = useState("");
  const [selectedVisit, setSelectedVisit] = useState(null);

  const [problem, setProblem] = useState("");
  const [treatments, setTreatments] = useState([{ name: "", cost: 0 }]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const treatmentsRef = useRef(null);


  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: token },
        });
        console.log("Doctor fetched:", res.data); // check console
        setDoctor(res.data);
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      }
    };

    if (token) fetchDoctor();
  }, [token]);


  const fetchVisits = async () => {
    try {
      setLoading(true);
      const res = await api.get("/visit/my-visits", {
        headers: { Authorization: token },
      });
      setVisits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [token]);

  const addTreatment = () =>
    setTreatments([...treatments, { name: "", cost: 0 }]);

  const handleChange = (i, field, value) => {
    const temp = [...treatments];
    temp[i][field] = field === "cost" ? parseFloat(value) : value;
    setTreatments(temp);
  };

  // --- Add this function here ---
  const handleMonthSelect = (monthIdx) => {
    setSelectedMonth(monthIdx); // set selected month
    setSelectedDate(null); // reset day selection when switching months
  };

  const getMonthlySummary = (year, month) => {
    const monthVisits = visits.filter((v) => {
      const date = new Date(v.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const completed = monthVisits.filter(v => v.status === "completed").length;
    const pending = monthVisits.filter(v => v.status !== "completed").length;
    const total = monthVisits.length;

    return { completed, pending, total };
  };

  const submit = async () => {
    try {
      if (!problem.trim()) {
        alert("Please enter the patient's problem or diagnosis.");
        return;
      }

      await api.post(
        `/visit/add-treatments/${visitId}`,
        { problem, treatments },
        { headers: { Authorization: token } }
      );
      alert("Treatments and problem added successfully!");
      await fetchVisits();
      setVisitId("");
      setProblem("");
      setTreatments([{ name: "", cost: 0 }]);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add treatments");
    }
  };

  if (loading) return <p>Loading appointments...</p>;

  const years = Array.from({ length: 2040 - 2025 + 1 }, (_, i) => 2025 + i);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getVisitsForDate = (date) => {
    const dateStr = formatDateLocal(date);
    return visits.filter((v) => v.date.split("T")[0] === dateStr);
  };


  return (


    <div style={{
      fontFamily: "'Poppins', sans-serif",
      background: "linear-gradient(to right, #e3f2fd, #bbdefb)",
      minHeight: "100vh",
      padding: 30,
      backgroundImage:
        "url('https://cdn.pixabay.com/photo/2017/02/01/09/32/doctor-2037152_1280.png')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right bottom",
      backgroundSize: "450px",
    }}>


      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          textAlign: "center",
          marginBottom: 25,
          fontFamily: "'Poppins', sans-serif",
          color: "#2b2b2b",
        }}
      >
        <h2 style={{ fontSize: 24, color: "#1976d2", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <img
            src={`${process.env.PUBLIC_URL}/heart-beat.png`}
            alt="Heart Icon"
            style={{ width: 28, height: 28 }}
          />
          Welcome to the Health Care Application
        </h2>
        <p style={{ fontSize: 15, color: "#555" }}>
          Manage your appointments, track patient progress, and make every visit meaningful.
        </p>
      </motion.div>




      {/* Doctor Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          marginBottom: 30,
          padding: "20px 25px",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.6)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ fontSize: 30, color: "#1976d2", marginBottom: 10 }}>
          <FaUserMd style={{ marginRight: 10 }} />
          Dr. {doctor?.name || "Name"}
        </h1>
        <hr
          style={{
            width: "300px",
            border: "2px solid #1976d2",
            margin: "10px 0",
            borderRadius: 5,
          }}
        />
        <h2 style={{ color: "#443b3be1", fontWeight: "500" }}>
          <FaCalendarAlt style={{ marginRight: 10, color: "#b2cde0ff" }} />
          Appointments & Calendar
        </h2>
      </motion.div>



      {/* Year / Month / Day Select */}
      {(!selectedDate && !visitId) && (
        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            borderRadius: 15,
            padding: 20,
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
          }}
        >

          {/* Step 1: Year */}
          {!selectedYear && (
            <div>
              <h3 style={{ color: "#1976d2" }}>Select Year</h3>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {years.map((year) => (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    style={{
                      margin: 10,
                      padding: "12px 18px",
                      border: "1px solid #1976d2",
                      borderRadius: 10,
                      cursor: "pointer",
                      background: "#e3f2fd",
                      fontWeight: "500",
                    }}
                  >
                    {year}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Months */}
          {selectedYear && selectedMonth === null && (
            <div>
              <button

                onClick={() => {
                  setSelectedYear(null); // go back to days
                  setVisitId("");         // hide add treatments form
                }}
                style={{
                  marginBottom: 15,
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: 8,
                  background: "#1976d2",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                ← Back to Years
              </button>

              <h3 style={{ color: "#1976d2" }}>Select Month for {selectedYear}</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
                {monthNames.map((month, idx) => {
                  const { completed, pending, total } = getMonthlySummary(selectedYear, idx);
                  return (
                    <motion.div
                      whileHover={{ scale: total > 0 ? 1.05 : 1 }}
                      key={month}
                      onClick={() => total > 0 && handleMonthSelect(idx)}
                      style={{
                        flex: "1 0 120px",
                        padding: "15px 10px",
                        borderRadius: 12,
                        border: total > 0 ? "1px solid #1976d2" : "1px solid #ccc",
                        background: total > 0 ? "#f0f9ff" : "#f5f5f5",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        cursor: total > 0 ? "pointer" : "not-allowed",
                        textAlign: "center",
                        color: "#333",
                      }}
                    >
                      <div style={{ fontWeight: "600", marginBottom: 6 }}>{month}</div>
                      <div style={{ fontSize: 13 }}>
                        <div style={{ color: "green" }}>✅ {completed}</div>
                        <div style={{ color: "red" }}>⏳ {pending}</div>
                        <div>Total: {total}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Days */}
          {/* Step 3: Days */}
          {selectedMonth !== null && !selectedDate && (
            getDaysInMonth(selectedYear, selectedMonth).some(day => getVisitsForDate(day).length > 0) && (
              <div

              >
                <button
                  onClick={() => {
                    setSelectedMonth(null); // go back to months
                    setVisitId("");         // hide add treatments form
                  }}
                  style={{
                    marginBottom: 15,
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: 8,
                    background: "#1976d2",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  ← Back to Months
                </button>

                <h3 style={{ color: "#1976d2" }}>
                  {monthNames[selectedMonth]} {selectedYear}
                </h3>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
                  {getDaysInMonth(selectedYear, selectedMonth).map((day) => {
                    const dayVisits = getVisitsForDate(day);
                    const completed = dayVisits.filter((v) => v.status === "completed").length;
                    const pending = dayVisits.filter((v) => v.status !== "completed").length;
                    const total = dayVisits.length;

                    return (
                      <motion.div
                        whileHover={{ scale: total > 0 ? 1.05 : 1 }}
                        key={day.toISOString()}
                        onClick={() => total > 0 && setSelectedDate(day)}
                        style={{
                          width: 80,
                          height: 80,
                          margin: 5,
                          borderRadius: 10,
                          border: "1px solid #ccc",
                          background: total > 0 ? "#e3f2fd" : "#fff",
                          textAlign: "center",
                          padding: 8,
                          cursor: total > 0 ? "pointer" : "default",
                        }}
                      >
                        <div style={{ fontWeight: "600", fontSize: 18 }}>{day.getDate()}</div>
                        {total > 0 && (
                          <div style={{ fontSize: 12, color: "#1976d2" }}>
                            <div style={{ color: "green" }}>{completed} ✅</div>
                            <div style={{ color: "red" }}>{pending} ⏳</div>
                            <div>Total: {total}</div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                </div>
              </div>
            )
          )}

        </div>
      )}

      {/* Step 4: Appointments */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "rgba(255,255,255,0.8)",
            borderRadius: 15,
            padding: 20,
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
            marginTop: 20,
          }}
        >
          <button
            onClick={() => {
              setSelectedDate(null); // go back to days
              setVisitId("");         // hide add treatments form
            }}
            style={{
              marginBottom: 15,
              padding: "8px 14px",
              border: "none",
              borderRadius: 8,
              background: "#1976d2",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ← Back to Days
          </button>

          <h3 style={{ color: "#1976d2" }}>Appointments for {selectedDate.toDateString()}</h3>

          {/* ✅ Summary line for appointments */}
          {(() => {
            const dayVisits = getVisitsForDate(selectedDate);
            const completedCount = dayVisits.filter(v => v.status === "completed").length;
            const pendingCount = dayVisits.filter(v => v.status !== "completed").length;

            if (dayVisits.length === 0) return null;

            return (
              <p style={{ fontWeight: "bold", marginBottom: 15, fontSize: 14 }}>
                Completed Appointments: <span style={{ color: "green" }}>{completedCount}</span> |{" "}
                Pending Appointments: <span style={{ color: "red" }}>{pendingCount}</span> |{" "}
                Total: {dayVisits.length}
              </p>
            );
          })()}

          {getVisitsForDate(selectedDate).length === 0 ? (
            <p>No appointments today.</p>
          ) : (
            getVisitsForDate(selectedDate).map((v) => (
              <motion.div
                key={v._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  borderRadius: 12,
                  background: "#f0f9ff",
                  padding: 15,
                  marginBottom: 12,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  border: "1px solid #1976d2",
                }}
              >
                <p>
                  <strong>Patient:</strong> {v.patient?.name} ({v.patient?.email})
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(v.date).toISOString().split("T")[0]} | <strong>Time:</strong> {v.time}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color:
                        v.status === "completed"
                          ? "green"
                          : v.status === "cancelled"
                            ? "red"
                            : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {v.status}
                  </span>
                </p>

                {v.problem && (
                  <p>
                    <strong>Diagnosis / Problem:</strong> {v.problem}
                  </p>
                )}

                {v.treatments?.length > 0 && (
                  <div>
                    <strong>Treatments:</strong>
                    <ul>
                      {v.treatments.map((t, i) => (
                        <li key={i}>
                          {t.name} — ${t.cost}
                        </li>
                      ))}
                    </ul>
                    <p>
                      <strong>Total:</strong> ${v.totalAmount}
                    </p>
                  </div>
                )}

                {v.status === "completed" ? (
                  <p style={{ color: "green", fontWeight: "bold", marginTop: 5 }}>
                    ✅ Completed
                  </p>
                ) : (
                  <button
                    onClick={() => {
                      setVisitId(v._id);         // set current visit ID so form shows
                      setSelectedVisit(v);       // set selected visit data
                      setTimeout(() => {
                        treatmentsRef.current?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    style={{
                      marginTop: 5,
                      padding: "5px 10px",
                      background: "#4caf50",
                      color: "#fff",
                      border: "none",
                      borderRadius: 5,
                      cursor: "pointer",
                    }}
                  >
                    Add Treatments
                  </button>

                )}
              </motion.div>
            ))
          )}
        </motion.div>
      )}


      {/* Add Treatments Form */}
      {visitId && (
        <motion.div
          ref={treatmentsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "#f8f9fa",
            borderRadius: 16,
            padding: 25,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            marginTop: 25,
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => {
              setVisitId(null);
              setSelectedVisit(null); // ✅ reset selected visit
            }}

            style={{
              marginBottom: 20,
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              background: "#1976d2",
              color: "#fff",
              fontWeight: "500",
              cursor: "pointer",
              transition: "0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1565c0"}
            onMouseLeave={e => e.currentTarget.style.background = "#1976d2"}
          >
            ← Back to Appointments
          </button>

          <h3
            style={{
              color: "#1976d2",
              marginBottom: 20,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Add Treatments for{" "}
            <span style={{ color: "#0d47a1" }}>
              {selectedVisit?.patient?.name || "Unknown Patient"}
            </span>{" "}
            —{" "}
            {selectedVisit
              ? new Date(selectedVisit.date).toISOString().split("T")[0]
              : "Unknown Date"}{" "}
            at {selectedVisit?.time || "Unknown Time"}{" "}
            <span
              style={{
                fontSize: 10,
                color: "#555",
                marginLeft: 500,
                fontWeight: 600,
              }}
            >
              Visit ID: {visitId}
            </span>
          </h3>



          {/* Problem / Diagnosis */}
          <div style={{ marginBottom: 25 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, color: "#333" }}>
              Problem / Diagnosis
            </label>
            <textarea
              placeholder="Describe the patient's condition or diagnosis"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              style={{
                width: "80%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #1976d2",
                background: "#fafdffff",
                outline: "none",
                fontSize: 14,
                resize: "vertical",
              }}
              rows={3}
            />
          </div>

          {/* Treatments */}
          <h4 style={{ color: "#1976d2", marginBottom: 15, fontSize: 18 }}>Treatments</h4>
          {treatments.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                width: "80%",
                display: "flex",
                gap: 15,
                padding: 15,
                marginBottom: 15,
                borderRadius: 14,
                background: "#fff",
                border: "1px solid #1976d2",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                alignItems: "flex-start",
              }}
            >
              {/* Treatment Name */}
              <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
                <label style={{ marginBottom: 5, fontWeight: 600, color: "#1976d2" }}>Treatment</label>
                <input
                  placeholder="Treatment Name"
                  value={t.name}
                  onChange={(e) => handleChange(i, "name", e.target.value)}
                  style={{
                    width: "85%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #1976d2",
                    background: "#ffffffff",
                    color: "#333333ff",
                    fontWeight: 500,
                    outline: "none",
                  }}
                />
              </div>

              {/* Cost */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <label style={{ marginBottom: 5, fontWeight: 600, color: "#1976d2" }}>Cost ($)</label>
                <input
                  placeholder="0"
                  type="number"
                  value={t.cost}
                  onChange={(e) => handleChange(i, "cost", e.target.value)}
                  style={{
                    width: "35%",
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid #1976d2",
                    background: "#ffffffff",
                    fontWeight: 500,
                    outline: "none",
                  }}
                />
              </div>
            </motion.div>
          ))}

          {/* Action Buttons */}
          <div style={{ marginTop: 10, display: "flex", gap: 15 }}>
            <button
              onClick={addTreatment}
              style={{
                padding: "10px 20px",
                background: "#0e75dcff",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1976d2"}
              onMouseLeave={e => e.currentTarget.style.background = "#2196f3"}
            >
              Add More
            </button>
            <button
              onClick={submit}
              style={{
                padding: "10px 20px",
                background: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#388e3c"}
              onMouseLeave={e => e.currentTarget.style.background = "#4caf50"}
            >
              Submit
            </button>
          </div>
        </motion.div>
      )}
      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          margin: "50px auto 35px auto", // added top margin (30px)
          padding: "10px 10px",          // smaller padding
          maxWidth: "450px",             // limit width
          borderRadius: 10,
          textAlign: "center",
          fontFamily: "'Oleo Script', cursive",
          fontSize: 16,                  // slightly larger for script font
          fontWeight: 300,               // script fonts usually look better lighter
          color: "white",
          background: "linear-gradient(135deg, #207ac3dc, #115191c9)",
          boxShadow: "0 6px 20px rgba(145, 197, 248, 0.55)",
          letterSpacing: "0.7px",
        }}
      >
        Every patient is a story, and you help write the happy endings.
      </motion.div>


    </div>
  );
}
