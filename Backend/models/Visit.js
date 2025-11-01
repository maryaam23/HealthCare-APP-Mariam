const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    problem: { type: String, default: "" },
    treatments: [{ name: String, cost: Number }],
    totalAmount: Number,
    status: { type: String, enum: ["pending", "in-progress", "completed", "cancelled"], default: "pending" },
    paid: { type: Boolean, default: false }, // <-- add this field, false means unpaid by default
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Visit", visitSchema);
