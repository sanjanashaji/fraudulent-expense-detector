import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function Signup() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate()

  const handleSignup = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/auth/signup", {
        username,
        password
      })

      alert("Signup successful")
      navigate("/login")

    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-600/18 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-blue-600/18 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-indigo-600/14 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-slate-800 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 shadow-[0_18px_40px_rgba(16,185,129,0.28)] flex items-center justify-center text-white font-semibold">
                EF
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 text-center tracking-tight">
              Signup
            </h1>
            <p className="mt-1 text-sm text-slate-500 text-center">
              Create your account to submit expense claims.
            </p>
          </div>

          <div className="px-7 py-6">
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Username
                </label>
                <input
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <button
                onClick={handleSignup}
                className="w-full mt-2 bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-3 rounded-xl font-semibold shadow-[0_16px_44px_rgba(16,185,129,0.28)] hover:from-emerald-700 hover:to-teal-700 transition-colors"
              >
                Signup
              </button>

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-slate-900 text-white p-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Back to Login
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Expense Fraud Detection Portal
        </p>
      </div>
    </div>
  )
}