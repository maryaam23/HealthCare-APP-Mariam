import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setSuccess("Login successful! Welcome back.");
      setError("");

      // Wait 1.5 seconds so the user sees the message, then call onLogin
      setTimeout(() => {
        onLogin(res.data.token, res.data.role);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
      setSuccess("");
    }
  };



  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #e2eef7ff, #e3eff8ff)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: 380,
          padding: 40,
          borderRadius: 16,
          background: "rgba(255,255,255,0.85)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Logo / Icon */}
        <img
          src={`${process.env.PUBLIC_URL}/heart-beat.png`}
          alt="Health Logo"
          style={{ width: 60, height: 60, marginBottom: 20 }}
        />

        {/* Title */}
        <h2 style={{ color: "#1976d2", marginBottom: 20, fontWeight: 600 }}>
          Health Care App Login
        </h2>

        {/* Inputs */}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 15,
            borderRadius: 12,
            border: "1px solid #1976d2",
            outline: "none",
            fontSize: 14,
            boxShadow: "0 3px 6px rgba(0,0,0,0.05)",
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 12,
            border: "1px solid #1976d2",
            outline: "none",
            fontSize: 14,
            boxShadow: "0 3px 6px rgba(0,0,0,0.05)",
          }}
        />

        {/* Login Button */}
        <button
          onClick={login}
          style={{
            width: "30%",
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: "#1976d2",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1565c0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1976d2")}
        >
          Login
        </button>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: 20,
              padding: "10px 20px",
              background: "#58b187ff",
              color: "#fff",
              borderRadius: 12,
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              fontWeight: 500,
            }}
          >
            {success}
          </motion.div>
        )}


        {/* Error Message */}
        {error && (
          <p style={{ color: "red", marginTop: 15, fontSize: 14 }}>{error}</p>
        )}

        {/* Motivational Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            marginTop: 25,
            textAlign: "center",
            fontFamily: "'Oleo Script', cursive",
            color: "#1976d2",
            fontSize: 16,
            fontWeight: 300,
            letterSpacing: "0.5px",
          }}
        >
          Your Health Journey Starts Here!
        </motion.p>
      </motion.div>
    </div>
  );
}
