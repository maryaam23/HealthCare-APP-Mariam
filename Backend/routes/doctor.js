const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Visit = require("../models/Visit");
const authMiddleware = require("../middleware/authMiddleware");

const workingDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const startHour = 8;
const endHour = 14; // exclusive → last slot 13:00

function generateSlots() {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    const label = `${h.toString().padStart(2, "0")}:00`;
    slots.push(label);
  }
  return slots;
}

// Get doctors with available days and times
router.get("/", authMiddleware(["patient"]), async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" });
    const result = [];
    const today = new Date();

    // Generate next 7 working days (skip weekends)
    const nextDays = [];
    for (let i = 0; nextDays.length < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      if (workingDays.includes(dayName)) nextDays.push(d);
    }

    for (const doc of doctors) {
      const doctorSchedule = [];

      for (const day of nextDays) {
        const dateStr = day.toISOString().split("T")[0];
        const slots = generateSlots();

        // Get visits for that doctor/date
        const visits = await Visit.find({ doctor: doc._id, date: dateStr });
        const reserved = visits.map((v) => v.time);

        const availableSlots = slots.filter((t) => !reserved.includes(t));
        doctorSchedule.push({ date: dateStr, availableSlots });
      }

      result.push({
        id: doc._id,
        name: doc.name,
        email: doc.email,
        schedule: doctorSchedule,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
