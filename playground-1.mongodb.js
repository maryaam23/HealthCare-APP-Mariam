use("healthcare");

// Insert multiple users (patients, doctors, finance)
db.getCollection("users").insertMany([
  {
    name: "Patient One",
    email: "patient1@test.com",
    password: "$2b$10$examplehashedpassword1", // use hashed password
    role: "patient"
  },
  {
    name: "Patient Two",
    email: "patient2@test.com",
    password: "$2b$10$examplehashedpassword2",
    role: "patient"
  },
  {
    name: "Doctor One",
    email: "doctor1@test.com",
    password: "$2b$10$examplehashedpassword3",
    role: "doctor"
  },
  {
    name: "Doctor Two",
    email: "doctor2@test.com",
    password: "$2b$10$examplehashedpassword4",
    role: "doctor"
  },
  {
    name: "Finance One",
    email: "finance1@test.com",
    password: "$2b$10$examplehashedpassword5",
    role: "finance"
  },
  {
    name: "Finance Two",
    email: "finance2@test.com",
    password: "$2b$10$examplehashedpassword6",
    role: "finance"
  }
]);
