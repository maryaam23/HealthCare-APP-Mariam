const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");
const authMiddleware = require("../middleware/authMiddleware");

// Patient reserves a visit
// Patient reserves a visit (with date & time)
const DoctorSchedule = require("../models/DoctorSchedule");

router.post("/reserve", authMiddleware(["patient"]), async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    if (!doctorId || !date || !time)
      return res.status(400).json({ msg: "doctorId, date and time are required" });

    const existing = await Visit.findOne({ doctor: doctorId, date, time });
    if (existing) return res.status(400).json({ msg: "Slot already reserved" });

    // Reserve visit
    const visit = new Visit({
      patient: req.user.id,
      doctor: doctorId,
      date,
      time,
    });
    await visit.save();

    // Update doctor’s schedule
    let schedule = await DoctorSchedule.findOne({ doctor: doctorId, date });
    if (!schedule) {
      const allSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00","14:00"];
      schedule = new DoctorSchedule({
        doctor: doctorId,
        date,
        availableSlots: allSlots.filter((s) => s !== time),
        reservedSlots: [time],
      });
    } else {
      schedule.availableSlots = schedule.availableSlots.filter((s) => s !== time);
      if (!schedule.reservedSlots.includes(time)) schedule.reservedSlots.push(time);
    }
    await schedule.save();

    res.json({ msg: "Visit reserved", visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Get all visits for logged-in doctor
router.get("/my-visits", authMiddleware(["doctor"]), async (req, res) => {
  try {
    const visits = await Visit.find({ doctor: req.user.id })
      .populate("patient", "name email") // show patient info
      .sort({ date: 1, time: 1 });
    res.json(visits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Doctor adds treatments
// routes/visit.js

router.post("/add-treatments/:id", async (req, res) => {
  try {
    const { treatments, problem } = req.body;
    const visit = await Visit.findById(req.params.id);
    if (!visit) return res.status(404).json({ msg: "Visit not found" });

    visit.problem = problem || visit.problem; // ✅ Save the diagnosis
    visit.treatments = treatments;
    visit.totalAmount = treatments.reduce((sum, t) => sum + (t.cost || 0), 0);
    visit.status = "completed";

    await visit.save();

    res.json({ msg: "Treatments and problem saved successfully", visit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
