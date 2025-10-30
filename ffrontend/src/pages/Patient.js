import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api";

import { FaUserMd, FaCalendarAlt, FaStethoscope, FaSignOutAlt } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";


export default function Patient({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ doctorId: "", date: "", time: "" });
  const [patient, setPatient] = useState(null);
  const [reservedSlots, setReservedSlots] = useState([]); // store reserved slots


  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: token },
        });
        console.log("Patient fetched:", res.data);
        setPatient(res.data);
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      }
    };

    if (token) fetchPatient();
  }, [token]);

  // After fetching doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors", {
          headers: { Authorization: token },
        });
        setDoctors(res.data);

        // Collect all reserved slots from DB into reservedSlots state
        const allReserved = [];
        res.data.forEach((doc) => {
          doc.schedule.forEach((day) => {
            day.reservedSlots.forEach((slot) => {
              allReserved.push({
                doctorId: doc.id,
                date: day.date,
                time: slot,
              });
            });
          });
        });
        setReservedSlots(allReserved);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [token]);



  const reserveVisit = async () => {
    if (!selected.doctorId || !selected.date || !selected.time) {
      alert("Select doctor, date, and time first");
      return;
    }
    try {
      await api.post("/visit/reserve", selected, {
        headers: { Authorization: token },
      });
      alert("Visit reserved successfully!");

      // add the reserved slot to state
      setReservedSlots((prev) => [
        ...prev,
        { doctorId: selected.doctorId, date: selected.date, time: selected.time },
      ]);


      setSelected({ doctorId: "", date: "", time: "" });
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to reserve visit");
    }
  };


  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Poppins', sans-serif",
          color: "#1976d2",
        }}
      >
        Loading doctors...
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(to right, #edf4faff, #e8f4ffff)",
        minHeight: "100vh",
        padding: 30,
      }}
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          textAlign: "center",
          marginBottom: 20,
          color: "#1976d2",
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
          }}
        >
          Doctors & Appointments
        </h2>
        <p style={{ fontSize: 15, color: "#555" }}>
          Choose a doctor, select a date and time, and reserve your visit easily.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          margin: "0 0 30px 0px", // top 0, right 0, bottom 30px, left 20px
          padding: "5px 15px",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255,255,255,0.75)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          textAlign: "left",
          maxWidth: "300px", // keeps box width controlled
        }}
      >
        <h1
          style={{
            fontSize: 18,
            color: "#1976d2",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <FaUserCircle style={{ color: "#1976d2" }} size={30} />
          Welcome, {patient?.name || "Patient"}!!
        </h1>


      </motion.div>





      {/* Doctors List */}
      {doctors.map((doc) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          }}
        >
          <h3 style={{ fontSize: 22, fontWeight: 600, color: "#1976d2", marginBottom: 15 }}>
            {doc.name}
          </h3>

          {doc.schedule.map((day) => {
            // Merge available + reserved slots
            const allSlots = [...day.availableSlots, ...day.reservedSlots];

            return (
              <div key={day.date} style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 14 }}>{day.date}</strong>
                <div style={{ display: "flex", flexWrap: "wrap", marginTop: 6 }}>
                  {allSlots.map((slot) => {
                    const isSelected =
                      selected.doctorId === doc.id &&
                      selected.date === day.date &&
                      selected.time === slot;

                    const isReserved =
                      day.reservedSlots.includes(slot) || // reserved in DB
                      reservedSlots.some(
                        (r) =>
                          r.doctorId === doc.id &&
                          r.date === day.date &&
                          r.time === slot
                      );

                    return (
                      <button
                        key={slot}
                        disabled={isReserved}
                        onClick={() =>
                          !isReserved &&
                          setSelected({ doctorId: doc.id, date: day.date, time: slot })
                        }
                        style={{
                          margin: 4,
                          padding: "6px 12px",
                          borderRadius: 10,
                          border: "none",
                          background: isReserved
                            ? "#e53935" // red for reserved
                            : isSelected
                              ? "#4caf50" // green for selected
                              : "#e3f2fd", // blue-ish default
                          color: isReserved || isSelected ? "#fff" : "#1976d2",
                          fontWeight: 500,
                          cursor: isReserved ? "not-allowed" : "pointer",
                          transition: "0.2s",
                        }}
                        onMouseEnter={(e) =>
                          !isReserved &&
                          (e.currentTarget.style.background = isSelected
                            ? "#388e3c"
                            : "#bbdefb")
                        }
                        onMouseLeave={(e) =>
                          !isReserved &&
                          (e.currentTarget.style.background = isSelected
                            ? "#4caf50"
                            : "#e3f2fd")
                        }
                      >
                        {slot} {isReserved && "(Reserved)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      ))}


      {/* Reserve Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "sticky",
          bottom: 20,
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        <button
          onClick={reserveVisit}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            fontWeight: 600,
            borderRadius: 14,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1565c0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1976d2")}
        >
          Reserve Visit
        </button>
      </motion.div>


      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          margin: "50px 0 35px 0",
          textAlign: "center", // or center if you like
          fontFamily: "'Oleo Script', cursive",
          fontSize: 18,
          fontWeight: 300,
          color: "#3a95df", // text color instead of background
          letterSpacing: "0.7px",
        }}
      >
        Your health journey starts here — choose the best doctor for you!
      </motion.div>

    </div>
  );
}
