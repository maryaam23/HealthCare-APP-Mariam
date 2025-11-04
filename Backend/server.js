//Backend run by ----> node server.js  It should run on http://localhost:5000  
// frontend on 3000
//Backend (Node.js + Express + MongoDB)  database, logic, and API requests.

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());  //allows frontend on port 3000 to call backend APIs on port 5000
app.use(express.json());

require("dotenv").config();  // Loads variables from .env file ex: database URI, secrets, or API keys

// Routes
app.use("/api/auth", require("./routes/auth")); // Any request starting with /api/auth goes to the auth router.
app.use("/api/visit", require("./routes/visit"));
app.use("/api/finance", require("./routes/finance"));
app.use("/api/doctors", require("./routes/doctor"));


// MongoDB connection
mongoose.connect(
  "mongodb+srv://1200837_db_user:maryam2003@cluster0.qxuk7ia.mongodb.net/healthcare",
  { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
  }
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// 🕒 Import and run cron job
require("./cron/autoCancelVisits");



// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
