const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, 
  availableSlots: [String],
  reservedSlots: [
    {
      time: String,
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["pending", "cancelled"], default: "pending" },
    }
  ]

});

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
