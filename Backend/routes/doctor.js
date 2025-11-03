const express = require("express");
const router = express.Router();
const User = require("../models/User");
const DoctorSchedule = require("../models/DoctorSchedule");
const authMiddleware = require("../middleware/authMiddleware");

const workingDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const startHour = 8;
const endHour = 15;

function generateSlots() {
  const slots = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

// allows a logged-in patient to get a list of all doctors along with their schedules for the next 7 working days.

router.get("/", authMiddleware(["patient"]), async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" });
    const result = [];
    const today = new Date();

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

        //  Get saved schedule from DB
        const schedule = await DoctorSchedule.findOne({
          doctor: doc._id,
          date: dateStr,
        });

        let availableSlots, reservedSlots;
        if (schedule) {
          availableSlots = schedule.availableSlots;
          reservedSlots = schedule.reservedSlots;
        } else {
          const allSlots = generateSlots();
          availableSlots = allSlots;
          reservedSlots = [];
        }

        doctorSchedule.push({
          date: dateStr,
          availableSlots,
          reservedSlots,
        });
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
