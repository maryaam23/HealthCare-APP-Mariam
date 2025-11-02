const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");
const authMiddleware = require("../middleware/authMiddleware");
const DoctorSchedule = require("../models/DoctorSchedule");


router.post("/cancel", authMiddleware(["patient"]), async (req, res) => {
  const { doctorId, date, time } = req.body;
  const patientId = req.user.id;

  try {
    // Convert date string to Date object for Visit query (if needed)
    const visitDate = new Date(date);

    // Find and delete the visit instead of marking it cancelled
    const visit = await Visit.findOneAndDelete({
      doctor: doctorId,
      patient: patientId,
      date: visitDate,
      time,
    });

    if (!visit) {
      return res.status(404).json({ msg: "Visit not found" });
    }

    // Update doctor's schedule: remove reserved slot and add it back to availableSlots
    const schedule = await DoctorSchedule.findOne({ doctor: doctorId, date });

    if (!schedule) {
      return res.status(404).json({ msg: "Doctor schedule not found" });
    }

    // Remove reserved slot for this time and patient
    schedule.reservedSlots = schedule.reservedSlots.filter(
      (slot) => !(slot.time === time && slot.patient.toString() === patientId)
    );

    // Add the slot back to availableSlots if not already there
    if (!schedule.availableSlots.includes(time)) {
      schedule.availableSlots.push(time);
      schedule.availableSlots.sort();
    }

    await schedule.save();

    res.json({
      msg: "Reservation cancelled successfully",
      updatedSchedule: schedule,
    });

  } catch (err) {
    console.error("Cancel reservation error:", err);
    res.status(500).json({ msg: "Server error during cancellation" });
  }
});

// ✅ Patient reserves a visit
function normalizeDate(dateStr) {
  const date = new Date(dateStr);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

router.post("/reserve", authMiddleware(["patient"]), async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ msg: "doctorId, date and time are required" });
    }

    const startOfDay = normalizeDate(date);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Check if slot is reserved for this doctor and date (anytime during the day)
    const existing = await Visit.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      time,
      status: { $ne: "cancelled" }
    });

    if (existing) {
      return res.status(400).json({ msg: "Slot already reserved" });
    }

    // Prevent same patient double booking
    const patientConflict = await Visit.findOne({
      patient: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      time,
      status: { $ne: "cancelled" }
    });

    if (patientConflict) {
      return res.status(400).json({ msg: "You already have a visit at this time" });
    }

    const visit = new Visit({
      patient: req.user.id,
      doctor: doctorId,
      date: startOfDay,
      time,
    });

    await visit.save();



    // ✅ Update the doctor's schedule
    let schedule = await DoctorSchedule.findOne({ doctor: doctorId, date });

    if (!schedule) {
      const defaultSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

      schedule = new DoctorSchedule({
        doctor: doctorId,
        date,
        availableSlots: defaultSlots.filter((s) => s !== time),
        reservedSlots: [{ time, patient: req.user.id }]
      });
    } else {
      schedule.availableSlots = schedule.availableSlots.filter((s) => s !== time);

      // ✅ Only add if not duplicated
      const alreadyReserved = schedule.reservedSlots.some(
        (s) => s.time === time
      );
      if (!alreadyReserved) {
        schedule.reservedSlots.push({ time, patient: req.user.id });
      }
    }

    await schedule.save();

    return res.json({
      msg: "Visit reserved successfully!",
      visit,
      updatedSchedule: schedule, // send the updated DoctorSchedule object
    });


  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
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
