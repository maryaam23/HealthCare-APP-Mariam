const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

//Backend run by ----> node server.js
// It should run on http://localhost:5000
//Backend (Node.js + Express + MongoDB)  database, logic, and API requests.


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
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



// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
