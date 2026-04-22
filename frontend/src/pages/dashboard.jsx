import { useEffect, useState } from "react"
import axios from "axios"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js"

import { Bar, Pie } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

export default function Dashboard() {
  const [expenses, setExpenses] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    axios
      .get("http://localhost:8000/expenses/")
      .then((response) => {
        setExpenses(response.data)
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error)
      })
  }, [])

  const changeStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:8000/expenses/${id}/status?status=${status}`
      )

      setExpenses((prevExpenses) =>
        prevExpenses.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                status,
                status_history: `${status} updated just now`
              }
            : expense
        )
      )
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("role")
    localStorage.removeItem("currentUser")
    window.location.replace("/login")
  }

  const riskBorder = {
    low: "#16a34a",
    medium: "#d97706",
    high: "#ea580c",
    critical: "#dc2626"
  }

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title?.toLowerCase().includes(search.toLowerCase()) ||
      exp.category?.toLowerCase().includes(search.toLowerCase()) ||
      exp.risk_level?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || exp.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const riskCounts = {
    low: expenses.filter((e) => e.risk_level === "low").length,
    medium: expenses.filter((e) => e.risk_level === "medium").length,
    high: expenses.filter((e) => e.risk_level === "high").length,
    critical: expenses.filter((e) => e.risk_level === "critical").length
  }

  const categoryCounts = {
    Food: expenses.filter((e) => e.category === "Food").length,
    Travel: expenses.filter((e) => e.category === "Travel").length,
    Equipment: expenses.filter((e) => e.category === "Equipment").length,
    Entertainment: expenses.filter((e) => e.category === "Entertainment").length
  }

  const barData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "Fraud Risk Distribution",
        data: [
          riskCounts.low,
          riskCounts.medium,
          riskCounts.high,
          riskCounts.critical
        ],
        backgroundColor: [
          "#22c55e",
          "#eab308",
          "#f97316",
          "#ef4444"
        ]
      }
    ]
  }

  const pieData = {
    labels: ["Food", "Travel", "Equipment", "Entertainment"],
    datasets: [
      {
        data: [
          categoryCounts.Food,
          categoryCounts.Travel,
          categoryCounts.Equipment,
          categoryCounts.Entertainment
        ],
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444"
        ]
      }
    ]
  }

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#e2e8f0"
        },
        grid: {
          color: "#334155"
        }
      },
      y: {
        ticks: {
          color: "#e2e8f0"
        },
        grid: {
          color: "#334155"
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">
              Expense Fraud Monitoring
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-xl"
          >
            Logout
          </button>
        </div>

        <div className="mb-6 rounded-xl bg-[#111827] border border-slate-700 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by title, category or risk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 rounded-xl bg-[#1e293b] text-white border border-slate-600"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-3 rounded-xl bg-[#1e293b] text-white border border-slate-600"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="reviewing">Reviewing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111827] rounded-xl p-4 border border-slate-700">
            <h2 className="text-white mb-4 font-semibold">
              Risk Distribution
            </h2>
            <div className="h-[300px]">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-[#111827] rounded-xl p-4 border border-slate-700">
            <h2 className="text-white mb-4 font-semibold">
              Category Split
            </h2>
            <div className="h-[300px]">
              <Pie
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        color: "#e2e8f0"
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-[#111827] rounded-xl p-6 border-l-4 border border-slate-700"
              style={{
                borderColor: riskBorder[exp.risk_level]
              }}
            >
              <div className="flex items-center gap-2">
  <h3 className="text-white font-semibold text-lg">
    {exp.title}
  </h3>

  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
    {exp.submitted_by}
  </span>
</div>

              <p className="text-slate-300 mt-2">
                {exp.category} • ₹{exp.amount}
              </p>

              <div className="mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    exp.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : exp.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : exp.status === "reviewing"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {exp.status?.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Submitted:{" "}
                {exp.submitted_at
                  ? new Date(exp.submitted_at).toLocaleString()
                  : "N/A"}
              </p>

              {exp.status_history && (
                <p className="text-xs text-slate-400 mt-1">
                  {exp.status_history}
                </p>
              )}

              <div className="mt-4 bg-[#1e293b] p-4 rounded-xl">
                <p className="text-slate-300 text-sm">
                  {exp.ai_explanation}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => changeStatus(exp.id, "approved")}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl"
                >
                  ✓ Approve
                </button>

                <button
                  onClick={() => changeStatus(exp.id, "rejected")}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl"
                >
                  ✗ Reject
                </button>

                <button
                  onClick={() => changeStatus(exp.id, "reviewing")}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-xl"
                >
                  👁 Review
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}