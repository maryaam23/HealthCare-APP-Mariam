// in this file:
// 1- import all pages in frontend
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Patient from "./pages/Patient";
import Doctor from "./pages/Doctor";
import Finance from "./pages/Finance";
import { FaSignOutAlt } from "react-icons/fa";



// 2- To allow user stay logged in even after refreshing the page
// check the local storage if a user is already logged in
// if yes the token, role set value    if no stay empty
//For ex: Frontend send (email , pass)  
// the backenf after login send (role:doctor, token:...) and save them in local storage

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");


  // 3- Login Function
  // After login successfully (in Login.js), this function is called with their token and role
  //This help us which page open after login depend on Role value
  const handleLogin = (token, role) => {
    // Save token and role in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    //React updates the UI immediately.
    setToken(token);
    setRole(role);
  };

  // 4- Logout Function
  // When user click on Logout button --> token and role are removed from storage and set them to empty
  // This clear authentication so it go back to login page

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setRole("");
  };

  //If token exists → show Logout button

  return (
    <Router>
      <div>
        {token && (
          <button
            onClick={handleLogout}
            style={{
              position: "fixed",
              bottom: 25,
              right: 25,
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
              color: "#fff",
              border: "none",
              borderRadius: "50px",
              padding: "12px 28px",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "0.5px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1565c0, #1e88e5)";
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(21, 101, 192, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #1976d2, #42a5f5)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(25, 118, 210, 0.3)";
            }}
          >
            <FaSignOutAlt style={{ marginRight: 8 }} />
            Logout
          </button>
        )}


        <Routes>

          <Route
            //If no token → show the Login page  if has token go to its page by role
            path="/"
            element={
              !token ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to={`/${role}`} />
              )
            }
          />
          <Route
            //only role = patient can open patient page if not keep it in login page
            path="/patient"
            element={
              role === "patient" ? (
                <Patient token={token} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/doctor"
            element={
              role === "doctor" ? <Doctor token={token} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/finance"
            element={
              role === "finance" ? (
                <Finance token={token} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
