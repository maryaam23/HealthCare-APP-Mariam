import { useState, useEffect } from "react";
import api from "../api";

export default function Patient({ token }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({ doctorId: "", date: "", time: "" });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors", {
          headers: { Authorization: token },
        });
        setDoctors(res.data);
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
      const res = await api.post(
        "/visit/reserve",
        selected,
        { headers: { Authorization: token } }
      );
      alert("Visit reserved successfully!");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to reserve visit");
    }
  };

  if (loading) return <p>Loading doctors...</p>;

  return (
    <div>
      <h2>Doctors & Availability</h2>
      {doctors.map((doc) => (
        <div key={doc.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <h3>{doc.name}</h3>
          {doc.schedule.map((day) => (
            <div key={day.date} style={{ marginBottom: 8 }}>
              <strong>{day.date}</strong>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {day.availableSlots.length === 0 ? (
                  <p style={{ marginLeft: 10 }}>No slots</p>
                ) : (
                  day.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      style={{
                        margin: 4,
                        padding: "5px 10px",
                        background:
                          selected.doctorId === doc.id &&
                          selected.date === day.date &&
                          selected.time === slot
                            ? "#4caf50"
                            : "#ddd",
                      }}
                      onClick={() =>
                        setSelected({ doctorId: doc.id, date: day.date, time: slot })
                      }
                    >
                      {slot}
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={reserveVisit}
        style={{ marginTop: 20, padding: "10px 20px" }}
      >
        Reserve Visit
      </button>
    </div>
  );
}
