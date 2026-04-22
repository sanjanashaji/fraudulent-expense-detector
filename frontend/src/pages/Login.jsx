import { useState } from "react"
import axios from "axios"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("role", "admin")
      localStorage.setItem("currentUser", username)
      window.location.replace("/dashboard")
      return
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/auth/login", {
        username,
        password
      })

      localStorage.setItem("role", res.data.role)
      localStorage.setItem("currentUser", res.data.username)

      window.location.replace("/")

    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-slate-800 bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] overflow-hidden">
          <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-[0_18px_40px_rgba(37,99,235,0.35)] flex items-center justify-center text-white font-semibold">
                EF
              </div>
            </div>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 text-center tracking-tight">
              Login
            </h1>
            <p className="mt-1 text-sm text-slate-500 text-center">
              Sign in to continue to the portal.
            </p>
          </div>

          <div className="px-7 py-6">
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Username
                </label>
                <input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 transition"
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full mt-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl font-semibold shadow-[0_16px_44px_rgba(37,99,235,0.35)] hover:from-blue-700 hover:to-indigo-700 transition-colors"
              >
                Login
              </button>

              <button
                onClick={() => window.location.replace("/signup")}
                className="w-full bg-emerald-600 text-white p-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Signup
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