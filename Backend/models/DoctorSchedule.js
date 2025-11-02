const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // keep string YYYY-MM-DD
  availableSlots: [String],
  reservedSlots: [
    {
      time: String,
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }
  ]
});

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
