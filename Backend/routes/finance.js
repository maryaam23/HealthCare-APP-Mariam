const express = require("express");
const router = express.Router();
const Visit = require("../models/Visit");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/search", authMiddleware(["finance"]), async (req,res)=>{
    const {doctorName, patientName, visitId} = req.query;

    let query = {};
    if(visitId) query._id = visitId;

    const visits = await Visit.find()
        .populate("doctor")
        .populate("patient");

    // Filter manually
    const filtered = visits.filter(v=>{
        return (!doctorName || v.doctor.name.includes(doctorName)) &&
               (!patientName || v.patient.name.includes(patientName)) &&
               (!visitId || v._id==visitId);
    });

    res.json(filtered);
});

module.exports = router;
