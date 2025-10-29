// Axios -- communication between frontend and backend
//
import axios from "axios";

const api = axios.create({
  //Backend runs on port 5000
  //the api route inside Backend/routes/
  // Ex: http://localhost:5000/api/doctor

  baseURL: "http://localhost:5000/api",
});


// so after this we can make
// get (go to backend and get info)  ,, post (send data to server)
// api.get("/doctor");     // Go to http://localhost:5000/api/doctor
// api.post("/auth/login"); // Go to http://localhost:5000/api/auth/login


export default api;
