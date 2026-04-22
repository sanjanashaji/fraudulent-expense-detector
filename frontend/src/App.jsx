import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import SubmitExpense from "./pages/SubmitExpense"
import Dashboard from "./pages/Dashboard"
import Login from "./pages/Login"
import Signup from "./pages/Signup"

export default function App() {
  const role = localStorage.getItem("role")

  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>

        <nav
          style={{
            background: "#1e3a8a",
            padding: "16px 24px",
            display: "flex",
            gap: "24px",
            alignItems: "center"
          }}
        >
          <span
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: "20px"
            }}
          >
            🛡️ ExpenseGuard AI
          </span>

          {role === "employee" && (
            <a href="/" style={{ color: "white" }}>Submit Claim</a>
          )}

          {role === "admin" && (
            <a href="/dashboard" style={{ color: "white" }}>Admin Dashboard</a>
          )}

          {!role && (
          <> 
          <a href="/login" style={{ color: "white" }}>Login</a>
          <a href="/signup" style={{ color: "white" }}>Signup</a>
          </>
          )}
        </nav>

        <Routes>

          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              role === "employee"
                ? <SubmitExpense />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/dashboard"
            element={
              role === "admin"
                ? <Dashboard />
                : <Navigate to="/login" />
            }
          />
          <Route path="/signup" element={<Signup />} />

        </Routes>
      </div>
    </BrowserRouter>
  )
}