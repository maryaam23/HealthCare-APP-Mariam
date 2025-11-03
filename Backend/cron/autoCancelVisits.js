//These code i make to canceled appointments that patient reserve but not attend to them -- still pending but time and date over

const cron = require("node-cron");  // like system clock
const Visit = require("../models/Visit");  //connect to visits collection in my mongoo DB
const DoctorSchedule = require("../models/DoctorSchedule");

//  // * * * * * == the code runs every minute.
// every minute, check if has any visits that should now be cancelled

cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();

        // Find all pending visits whose date/time is Expire
        // find : function on Mongoo DB to find as condititon we put inside it and put it inside const expiredVisits
        const expiredVisits = await Visit.find({
            status: "pending",
            date: { $lte: now },  //less than or equal our now time
        });

        for (const visit of expiredVisits) {  //make loop for all expire visits to update its status to cancelled insted pending
            // Cancel the visit
            visit.status = "cancelled";
            await visit.save();

            // Update the DoctorSchedule
            // By Find the schedule document for this doctor as the expired visit date.
            const schedule = await DoctorSchedule.findOne({
                doctor: visit.doctor,
                date: visit.date.toISOString().split('T')[0]  //visit.date it have both date and time.
                                                              //extracts only the date part to match My DB formate
            });

            if (schedule) {
                //schedule.reservedSlots is an array of slot objects.
                //.find loop through every element in that array.
                //For each element, it temporarily name s to check conditions.

                const slot = schedule.reservedSlots.find(     // Java find func
                    // It searches inside the reservedSlots array for element that matches both conditions:
                    s => s.time === visit.time && s.patient.toString() === visit.patient.toString()
                );
                if (slot) {
                    slot.status = "cancelled";
                    await schedule.save();
                }
            }
        }

        // //console.log(`✅ Auto-cancelled ${expiredVisits.length} expired visits`);

    } catch (error) {
        console.error("❌ Auto-cancel job failed:", error);
    }
});
