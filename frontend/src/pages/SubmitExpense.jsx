import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://127.0.0.1:8000"

export default function SubmitExpense() {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
    receipt: null,
    user_id: 1
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState("")
  const [myClaims, setMyClaims] = useState([])

  const currentUser = localStorage.getItem("currentUser")

  const logout = () => {
    localStorage.removeItem("role")
    localStorage.removeItem("currentUser")
    window.location.replace("/login")
  }

  const isMeaningfulText = (text) => {
    return /^[A-Za-z0-9\s.,-]{3,}$/.test(text) && /[A-Za-z]/.test(text)
  }

  useEffect(() => {
    loadClaims()
  }, [])

  const loadClaims = async () => {
    try {
      const res = await axios.get(`${API}/expenses/`)

      const filtered = res.data.filter(
        claim => claim.submitted_by?.toLowerCase() === currentUser?.toLowerCase()
      )

      setMyClaims(filtered)

    } catch (err) {
      console.log(err)
    }
  }

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0]

    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post(`${API}/upload-receipt/`, formData)

      setForm(prev => ({
        ...prev,
        title: res.data.title || "Receipt Expense",
        amount: res.data.amount || 500,
        category: res.data.category || "",
        description: res.data.description || "Auto extracted from receipt",
        receipt: file
      }))

    } catch (err) {
      console.log("OCR upload failed:", err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)
    setSuccess("")

    if (!isMeaningfulText(form.title)) {
      setError("Title must contain meaningful words only")
      setLoading(false)
      return
    }

    if (!isMeaningfulText(form.description)) {
      setError("Description must contain meaningful words only")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()

      formData.append("title", form.title)
      formData.append("amount", String(form.amount))
      formData.append("category", form.category)
      formData.append("description", form.description)
      formData.append("user_id", String(form.user_id))
      formData.append("username", currentUser)

      if (form.receipt) {
        formData.append("receipt", form.receipt)
      }

      const res = await axios.post(`${API}/expenses/`, formData)

      setResult(res.data)
      setSuccess("Submitted successfully ✅")

      setForm({
        title: "",
        amount: "",
        category: "",
        description: "",
        receipt: null,
        user_id: 1
      })

      loadClaims()

    } catch (err) {
      setError(err.response?.data?.detail || err.message)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #020617)",
        padding: "32px 16px"
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          color: "#0f172a"
        }}
      >
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px"
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#f9fafb",
                margin: 0,
                letterSpacing: "0.02em"
              }}
            >
              Submit Expense Claim
            </h1>
            <p
              style={{
                marginTop: "6px",
                fontSize: "14px",
                color: "#9ca3af"
              }}
            >
              File a new reimbursement request and get an instant AI fraud risk
              assessment.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "rgba(15,23,42,0.75)",
              padding: "8px 14px",
              borderRadius: "999px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
              border: "1px solid rgba(148,163,184,0.35)",
              backdropFilter: "blur(16px)"
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "white",
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "18px",
                boxShadow: "0 10px 20px rgba(37,99,235,0.45)"
              }}
            >
              {currentUser?.charAt(0).toUpperCase()}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#e5e7eb"
                }}
              >
                {currentUser}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#9ca3af"
                }}
              >
                Employee
              </span>
            </div>

            <button
              onClick={logout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "999px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                boxShadow: "0 10px 20px rgba(239,68,68,0.55)",
                whiteSpace: "nowrap"
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.8fr)",
            gap: "20px"
          }}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.96)",
              borderRadius: "24px",
              padding: "24px 22px",
              boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.55)",
              backdropFilter: "blur(18px)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px"
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#e5e7eb",
                    margin: 0
                  }}
                >
                  Expense details
                </h2>
                <p
                  style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    color: "#9ca3af"
                  }}
                >
                  Provide clear, concise information for accurate assessment.
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.6)",
                  color: "#9ca3af"
                }}
              >
                AI fraud check enabled
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#e5e7eb"
                    }}
                  >
                    Title
                  </label>
                  <input
                    placeholder="E.g. Client dinner with team"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(55,65,81,0.9)",
                      background: "rgba(15,23,42,0.85)",
                      color: "#f9fafb",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 120px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#e5e7eb"
                      }}
                    >
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(55,65,81,0.9)",
                        background: "rgba(15,23,42,0.85)",
                        color: "#f9fafb",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                  </div>

                  <div style={{ flex: "1 1 160px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#e5e7eb"
                      }}
                    >
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(55,65,81,0.9)",
                        background: "rgba(15,23,42,0.9)",
                        color: "#f9fafb",
                        fontSize: "14px",
                        outline: "none",
                        appearance: "none"
                      }}
                    >
                      <option value="">Select Category</option>
                      {["Food", "Travel", "Equipment", "Entertainment", "Training", "Other"].map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#e5e7eb"
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    placeholder="Add context such as client name, purpose, attendees, and any relevant notes."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      minHeight: "90px",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(55,65,81,0.9)",
                      background: "rgba(15,23,42,0.85)",
                      color: "#f9fafb",
                      fontSize: "14px",
                      resize: "vertical",
                      outline: "none"
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#e5e7eb"
                    }}
                  >
                    Receipt (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    style={{
                      marginBottom: "2px",
                      fontSize: "13px",
                      color: "#9ca3af"
                    }}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280"
                    }}
                  >
                    Upload a clear photo or scan of the receipt. Details may be
                    auto-filled where possible.
                  </span>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "white",
                    padding: "11px 16px",
                    border: "none",
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "14px",
                    boxShadow: "0 18px 45px rgba(37,99,235,0.65)",
                    cursor: "pointer",
                    letterSpacing: "0.03em"
                  }}
                >
                  {loading ? "Analysing with AI..." : "Submit for review"}
                </button>
              </div>
            </form>

            {success && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "rgba(22,163,74,0.1)",
                  border: "1px solid rgba(22,163,74,0.5)",
                  color: "#bbf7d0",
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                {success}
              </div>
            )}

            {error && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.6)",
                  color: "#fecaca",
                  fontSize: "13px"
                }}
              >
                ❌ {error}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            {result && (
              <div
                style={{
                  background: "rgba(15,23,42,0.96)",
                  padding: "22px 20px",
                  borderRadius: "24px",
                  boxShadow: "0 24px 60px rgba(15,23,42,0.85)",
                  border: "1px solid rgba(148,163,184,0.55)",
                  backdropFilter: "blur(18px)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px"
                  }}
                >
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#e5e7eb",
                      margin: 0
                    }}
                  >
                    🤖 AI Analysis Result
                  </h2>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#9ca3af"
                    }}
                  >
                    Fraud risk insight
                  </span>
                </div>

                <div
                  style={{
                    padding: "16px",
                    background:
                      result.risk_level === "low"
                        ? "#dcfce7"
                        : result.risk_level === "medium"
                        ? "#fef9c3"
                        : result.risk_level === "high"
                        ? "#ffedd5"
                        : "#fee2e2",
                    borderRadius: "14px",
                    marginBottom: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        fontWeight: 600,
                        color: "#4b5563",
                        marginBottom: "4px"
                      }}
                    >
                      Risk level
                    </div>
                    <h3
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        margin: 0,
                        color: "#111827"
                      }}
                    >
                      {result.risk_level.toUpperCase()}
                    </h3>
                  </div>
                  <div
                    style={{
                      textAlign: "right"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        fontWeight: 600,
                        color: "#4b5563",
                        marginBottom: "4px"
                      }}
                    >
                      Fraud score
                    </div>
                    <p
                      style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        margin: 0,
                        color: "#111827"
                      }}
                    >
                      {result.fraud_score}/100
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 0 2px",
                    borderTop: "1px dashed rgba(148,163,184,0.6)"
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: "#9ca3af",
                      marginBottom: "6px"
                    }}
                  >
                    AI rationale
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#d1d5db",
                      lineHeight: 1.6,
                      margin: 0
                    }}
                  >
                    {result.ai_explanation}
                  </p>
                </div>
              </div>
            )}

            <div
              style={{
                background: "rgba(15,23,42,0.96)",
                padding: "18px 18px 14px",
                borderRadius: "24px",
                boxShadow: "0 24px 60px rgba(15,23,42,0.85)",
                border: "1px solid rgba(148,163,184,0.55)",
                backdropFilter: "blur(18px)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px"
                }}
              >
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#e5e7eb",
                    margin: 0
                  }}
                >
                  My submitted claims
                </h2>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af"
                  }}
                >
                  {myClaims.length} total
                </span>
              </div>

              <div
                style={{
                  maxHeight: "260px",
                  overflowY: "auto",
                  paddingRight: "4px"
                }}
              >
                {myClaims.map((claim) => (
                  <div
                    key={claim.id}
                    style={{
                      background: "rgba(15,23,42,0.9)",
                      padding: "10px 10px",
                      borderRadius: "12px",
                      marginBottom: "8px",
                      border: "1px solid rgba(55,65,81,0.9)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "3px"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#e5e7eb"
                        }}
                      >
                        {claim.title}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af"
                        }}
                      >
                        ₹{claim.amount}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "3px"
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#6b7280"
                        }}
                      >
                        Status
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: "rgba(15,23,42,0.9)",
                          border: "1px solid rgba(148,163,184,0.6)",
                          color: "#e5e7eb",
                          textTransform: "capitalize"
                        }}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}

                {myClaims.length === 0 && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      paddingTop: "4px"
                    }}
                  >
                    You haven&apos;t submitted any claims yet. New requests will
                    appear here.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}