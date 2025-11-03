import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../api";
import { FaUserCircle } from "react-icons/fa";

export default function Patient({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ doctorId: "", date: "", time: "" });
  const [patient, setPatient] = useState(null);
  const [reservedSlots, setReservedSlots] = useState([]); // store reserved slots
  const [notification, setNotification] = useState({ type: "", message: "" });



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
    if (token) {
      fetchDoctors();

      // optional: refresh every 5 minutes
      const interval = setInterval(() => {
        fetchDoctors();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [token]);


  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/doctors", {
        headers: { Authorization: token },
      });
      setDoctors(res.data);

      const allReserved = [];
      res.data.forEach((doc) => {
        doc.schedule.forEach((day) => {
          day.reservedSlots.forEach((slotObj) => {
            allReserved.push({
              doctorId: doc.id,
              date: day.date,
              time: slotObj.time,
              patientId: slotObj.patient || null,
              status: slotObj.status || "pending", // include real status from DB
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


  const reserveVisit = async () => {
    if (!selected.doctorId || !selected.date || !selected.time) {
      showNotification("error", "⚠️ Please select doctor, date, and time first");
      return;
    }
    try {
      const res = await api.post("/visit/reserve", selected, {
        headers: { Authorization: token },
      });

      showNotification("success", res.data.message || "Visit reserved successfully!");

      // Update reservedSlots locally
      setReservedSlots((prev) => [
        ...prev,
        {
          doctorId: selected.doctorId,
          date: selected.date,
          time: selected.time,
          patientId: patient?._id,
          status: "pending",  // <-- include status
        },
      ]);

      // Update doctors schedules locally
      setDoctors((prevDoctors) =>
        prevDoctors.map((doc) => {
          if (doc.id === selected.doctorId) {
            return {
              ...doc,
              schedule: doc.schedule.map((day) => {
                if (day.date === selected.date) {
                  return {
                    ...day,
                    availableSlots: day.availableSlots.filter((s) => s !== selected.time),
                    reservedSlots: [...day.reservedSlots, { time: selected.time, patient: patient?._id }],
                  };
                }
                return day;
              }),
            };
          }
          return doc;
        })
      );

      setSelected({ doctorId: "", date: "", time: "" });
    } catch (err) {
      showNotification("error", err.response?.data?.msg || "Failed to reserve visit");
    }
  };

  const cancelReservation = async () => {
    if (!selected.doctorId || !selected.date || !selected.time) {
      showNotification("error", "Select the slot you want to cancel");
      return;
    }

    try {
      const res = await api.post("/visit/cancel", selected, {
        headers: { Authorization: token },
      });

      showNotification("success", res.data.message || "Reservation cancelled ✅");

      // Update reservedSlots locally
      setReservedSlots((prev) =>
        prev.filter(
          (r) =>
            !(
              r.doctorId === selected.doctorId &&
              r.date === selected.date &&
              r.time === selected.time
            )
        )
      );

      // Update doctors schedules locally
      setDoctors((prevDoctors) =>
        prevDoctors.map((doc) => {
          if (doc.id === selected.doctorId) {
            return {
              ...doc,
              schedule: doc.schedule.map((day) => {
                if (day.date === selected.date) {
                  return {
                    ...day,
                    availableSlots: [...day.availableSlots, selected.time].sort(),
                    reservedSlots: day.reservedSlots.filter((slot) => slot.time !== selected.time),
                  };
                }
                return day;
              }),
            };
          }
          return doc;
        })
      );

      setSelected({ doctorId: "", date: "", time: "" });
    } catch (err) {
      console.error("Cancel API error:", err);
      showNotification("error", err.response?.data?.msg || "Failed to cancel");
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

  // Define at top level inside the component
  const selectedIsMyActiveReservation = reservedSlots.some(
    (r) =>
      r.doctorId === selected.doctorId &&
      r.date === selected.date &&
      r.time === selected.time &&
      r.patientId === patient?._id &&
      r.status !== "cancelled"
  );


  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Auto hide after 3 seconds
    setTimeout(() => setNotification({ type: "", message: "" }), 3000);
  };


  return (

    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        background: "linear-gradient(to right, #edf4faff, #e8f4ffff)",
        minHeight: "100vh",
        padding: "40px 20px",
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
            background: notification.type === "success"
              ? "linear-gradient(90deg, #43a047, #66bb6a)"
              : "linear-gradient(90deg, #d32f2f, #ef5350)",
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

          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          textAlign: "left",
          maxWidth: 300,

          backgroundColor: "rgba(255,255,255,0.9)",
          borderLeft: "6px solid #1976d2",

          // keeps box width controlled
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
            background: "#fff",
            borderRadius: 20,
            padding: "24px 28px",
            marginBottom: 25,
            boxShadow: "0 6px 18px rgba(25,118,210,0.15)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(25,118,210,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(25,118,210,0.15)";
          }}

        >
          <h3 style={{ fontSize: 22, fontWeight: 600, color: "#1976d2", marginBottom: 15 }}>
            {doc.name}
          </h3>

          {doc.schedule.map((day) => {
            const reservedTimes = day.reservedSlots.map((s) => s.time);
            const allSlots = [...day.availableSlots, ...reservedTimes];

            return (
              <div key={day.date} style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 14 }}>{day.date}</strong>
                <div style={{ display: "flex", flexWrap: "wrap", marginTop: 6 }}>
                  {allSlots.map((slot) => {
                    const isSelected =
                      selected.doctorId === doc.id &&
                      selected.date === day.date &&
                      selected.time === slot;

                    const isReserved = day.reservedSlots.some((s) => s.time === slot);
                    const slotRecord = reservedSlots.find(
                      (r) =>
                        r.doctorId === doc.id &&
                        r.date === day.date &&
                        r.time === slot &&
                        r.patientId === patient?._id
                    );

                    const reservedByUser = slotRecord && slotRecord.status === "pending";
                    const visitStatus = slotRecord?.status;
                    // ✅ Move isPastSlot calculation here
                    const isPastSlot = new Date(`${day.date}T${slot}:00`) <= new Date();



                    return (
                      <button
                        key={slot}
                        disabled={
                          visitStatus === "cancelled" ||
                          (isReserved && !reservedByUser) ||
                          isPastSlot
                        }
                        onClick={() => setSelected({ doctorId: doc.id, date: day.date, time: slot })}
                        style={{
                          margin: 4,
                          padding: "8px 14px",
                          borderRadius: 10,
                          fontSize: 12,
                          border: "none",
                          fontWeight: "bold",
                          background:
                            visitStatus === "cancelled"
                              ? "#9e9e9e" // gray for cancelled
                              : isPastSlot
                                ? "#b0bec5" // gray for past slot
                                : reservedByUser
                                  ? "#4caf50"
                                  : isReserved
                                    ? "#e53935"
                                    : isSelected
                                      ? "#1565c0"
                                      : "#e3f2fd",
                          color:
                            visitStatus === "cancelled" || isPastSlot
                              ? "#fff"
                              : reservedByUser || isReserved || isSelected
                                ? "#fff"
                                : "#1976d2",
                          cursor:
                            visitStatus === "cancelled" || isPastSlot
                              ? "not-allowed"
                              : isReserved && !reservedByUser
                                ? "not-allowed"
                                : "pointer",
                          fontWeight: 500,
                          transition: "0.2s",
                        }}
                      >
                        {slot}{" "}
                        {visitStatus === "cancelled"
                          ? "(Cancelled - You Did Not Attend ❌)"

                          : reservedByUser
                            ? "(You Reserved)"
                            : isReserved
                              ? "(Reserved)"
                              : ""}
                      </button>


                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      ))}

      {/* Reserve / Cancel Button */}
      {/* Reserve / Cancel Button */}
      {selected.time && (
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
          {selectedIsMyActiveReservation ? (
            <button
              onClick={cancelReservation}
              style={{
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 14,
                border: "none",
                background: "#e53935",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#c62828")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#e53935")}
            >
              Cancel Reservation ❌
            </button>
          ) : (
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
          )}


        </motion.div>
      )}


      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          margin: "50px 0 35px 0",
          textAlign: "center",
          fontFamily: "'Oleo Script', cursive",

          fontWeight: 300,

          letterSpacing: "0.7px",

          fontSize: 20,
          color: "#1976d2",
          textShadow: "0 1px 3px rgba(25,118,210,0.2)",

        }}
      >
        Your health journey starts here — choose the best doctor for you!
      </motion.div>
    </div>
  );
}
