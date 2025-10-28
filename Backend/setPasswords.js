const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Make sure this path is correct

mongoose.connect(
  "mongodb+srv://1200837_db_user:maryam2003@cluster0.qxuk7ia.mongodb.net/healthcare"
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

async function updatePasswords() {
  const users = ["patient@test.com", "doctor@test.com", "finance@test.com"];
  const plainPassword = "123456";

  for (const email of users) {
    const hashed = await bcrypt.hash(plainPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashed } });
    console.log(`Password updated for ${email}`);
  }

  mongoose.disconnect();
}

updatePasswords();
