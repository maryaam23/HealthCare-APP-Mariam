const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");
const authMiddleware = require("../middleware/authMiddleware");

// Patient reserves a visit
// Patient reserves a visit (with date & time)
router.post("/reserve", authMiddleware(["patient"]), async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;
    if (!doctorId || !date || !time)
      return res.status(400).json({ msg: "doctorId, date and time are required" });

    // Check if doctor busy in same slot
    const existing = await Visit.findOne({ doctor: doctorId, date, time });
    if (existing) return res.status(400).json({ msg: "Slot already reserved" });

    const visit = new Visit({
      patient: req.user.id,
      doctor: doctorId,
      date,
      time,
    });
    await visit.save();
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
