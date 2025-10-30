const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  availableSlots: [String],
  reservedSlots: [String],
});

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
