const express = require("express");  // this import to can build API
const router = express.Router();
const Visit = require("../models/Visit");  
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");  // for protect, allows only authorized roles to access


// PATCH route: update payment status of a visit
// Only accessible by finance route
router.patch("/update-paid/:id", authMiddleware(["finance"]), async (req, res) => {
    try {
        const { paid } = req.body;
        const visit = await Visit.findById(req.params.id); // Find visit by ID
        if (!visit) return res.status(404).json({ msg: "Visit not found" });

        // Only allow updating payment if visit stutus = completed
        if (visit.status !== "completed") {
            return res.status(400).json({ msg: "Only completed visits can be marked as paid" });
        }

        // Update the paid field and save changes to DB
        visit.paid = paid;
        await visit.save();

        res.json({ msg: "Visit payment status updated", visit });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// GET route: fetch visits
// Allows filtering by doctor name, patient name, visit ID, status, and sorting
// Only accessible by finance role

router.get("/visits", authMiddleware(["finance"]), async (req, res) => {
    try {
        const { doctorName, patientName, visitId, status, sortBy } = req.query;
        
        //1- search by VisitId
        if (visitId) {
            if (!visitId.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(400).json({ msg: "Invalid visit ID format" });
            }

            const visit = await Visit.findById(visitId)
                .populate("doctor", "name email")    // get the info for this id dont send just id found
                .populate("patient", "name email");

            if (!visit) {
                return res.status(404).json({ msg: "Visit not found" });
            }

            return res.json([visit]);
        }

        
        const aggregatePipeline = [];  // this allow make filtering, sorting easily

        aggregatePipeline.push({   // joins the data from users collection into visits, where: visits.doctor matches users._id.
            $lookup: {
                from: "users",
                localField: "doctor",
                foreignField: "_id",
                as: "doctor",
            },
        });
        aggregatePipeline.push({ $unwind: "$doctor" });  // convert array to normal obj
                                                        // result for ex:  "doctor": "_id": "1", "name": "Dr.", "email": "dr"


        
        aggregatePipeline.push({
            $lookup: {
                from: "users",
                localField: "patient",
                foreignField: "_id",
                as: "patient",
            },
        });
        aggregatePipeline.push({ $unwind: "$patient" });



        // to get all filter conditions
        const andConditions = [];

        if (doctorName) { // this what user write in textbox
            // add condition of doctor name to filter 
            //  i:  make regex case-insensitive , regrex for match
            andConditions.push({ "doctor.name": { $regex: doctorName, $options: "i" } });
        }
        if (patientName) {
            andConditions.push({ "patient.name": { $regex: patientName, $options: "i" } });
        }
        if (status) {
            andConditions.push({ status: { $regex: `^${status}$`, $options: "i" } });
        }

        if (andConditions.length > 0) {
            aggregatePipeline.push({ $match: { $and: andConditions } });  //match to apply filters conditions
        }

        
        // combine date with time to can make sorting by using them together
        aggregatePipeline.push({
            $addFields: {
                dateTime: {
                    $dateFromParts: {
                        year: { $year: "$date" },
                        month: { $month: "$date" },
                        day: { $dayOfMonth: "$date" },
                        hour: {
                            $toInt: {
                                $arrayElemAt: [
                                    { $split: ["$time", ":"] },
                                    0
                                ]
                            }
                        },
                        minute: {
                            $toInt: {
                                $arrayElemAt: [
                                    { $split: ["$time", ":"] },
                                    1
                                ]
                            }
                        },
                        second: 0,
                        millisecond: 0,
                    }
                }
            }
        });

        // Sorting
        if (sortBy) {
            let sortStage = {};
            switch (sortBy) {
                case "date_asc":
                    sortStage = { date: 1 };
                    break;
                case "date_desc":
                    sortStage = { date: -1 };
                    break;
                case "time_asc":
                    sortStage = { time: 1 };
                    break;
                case "time_desc":
                    sortStage = { time: -1 };
                    break;
                case "datetime_asc":
                    sortStage = { dateTime: 1 };
                    break;
                case "datetime_desc":
                    sortStage = { dateTime: -1 };
                    break;
                default:
                    sortStage = {};
                    break;
            }

            if (Object.keys(sortStage).length > 0) {
                aggregatePipeline.push({ $sort: sortStage });
            }
        }


        
        aggregatePipeline.push({
            $project: {  // to choose what feild appear in final result in UI
                _id: 1,
                date: 1,
                time: 1,
                problem: 1,
                treatments: 1,
                totalAmount: 1,
                status: 1,
                paid: 1,        
                createdAt: 1,
                "doctor._id": 1,
                "doctor.name": 1,
                "doctor.email": 1,
                "patient._id": 1,
                "patient.name": 1,
                "patient.email": 1,
            },
        });


        const visits = await Visit.aggregate(aggregatePipeline); //run all pipelines one by one — then give me the final result


        res.json(visits); // Sends the final visit data to the frontend
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});


module.exports = router;
