import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getExpenses, addExpense, deleteExpense, updateExpense } from "../services/api";
import { getTheme } from "../utils/timeTheme";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
const CATEGORY_ICONS = { Food: "🍔", Transport: "🚗", Shopping: "🛍️", Bills: "💡", Entertainment: "🎬", Health: "💊", Education: "📚", Other: "📦" };
const CATEGORY_COLORS = { Food: "#FF6B6B", Transport: "#4ECDC4", Shopping: "#45B7D1", Bills: "#FFA07A", Entertainment: "#98D8C8", Health: "#FF8B94", Education: "#A8E6CF", Other: "#DDA0DD" };

export default function Dashboard() {
  const [theme, setTheme] = useState(getTheme());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [usedImages, setUsedImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterDays, setFilterDays] = useState("all");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [form, setForm] = useState({
    amount: "", description: "", category: "Food",
    expenseDate: new Date().toISOString().split("T")[0]
  });
  const formRef = useRef(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!userId) { navigate("/"); return; }
    fetchExpenses();
    const interval = setInterval(() => setTheme(getTheme()), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses(userId);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageHash = `${file.name}-${file.size}-${file.lastModified}`;
    if (usedImages.includes(imageHash)) {
      alert("⚠️ You already used this screenshot! Please upload a different one.");
      e.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      setScanning(true);
      const response = await axios.post("http://localhost:8080/api/ai/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = response.data;
      setForm({
        amount: data.amount || "",
        description: data.description || "",
        category: data.category || "Other",
        expenseDate: data.date || new Date().toISOString().split("T")[0],
      });
      setUsedImages((prev) => [...prev, imageHash]);
      setShowForm(true);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.error("Image extraction failed:", err);
      alert("Could not read the image. Please fill manually.");
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        user: { id: parseInt(userId) },
        category: { name: form.category },
        amount: parseFloat(form.amount),
        description: form.description,
        expenseDate: form.expenseDate,
      };
      if (editingExpense) {
        await updateExpense(editingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      setForm({ amount: "", description: "", category: "Food", expenseDate: new Date().toISOString().split("T")[0] });
      setShowForm(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
      await deleteExpense(id);
      fetchExpenses();
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category?.name || "Other",
      expenseDate: expense.expenseDate,
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const filteredExpenses = expenses.filter((e) => {
    if (filterDays === "all") return true;
    const diff = (new Date() - new Date(e.expenseDate)) / (1000 * 60 * 60 * 24);
    return diff <= parseInt(filterDays);
  });

  const totalSpending = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const avgSpending = filteredExpenses.length > 0 ? totalSpending / filteredExpenses.length : 0;
  const categoryTotals = filteredExpenses.reduce((acc, e) => {
    const cat = e.category?.name || "Other";
    acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
    return acc;
  }, {});
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  const sidebarItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "expenses", icon: "💳", label: "Expenses" },
    { id: "analytics", icon: "📈", label: "Analytics" },
  ];

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: "10px",
    border: "2px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.9)",
    fontSize: "0.9rem", marginTop: "6px", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: theme.background,
      fontFamily: "'Segoe UI', sans-serif",
      transition: "all 1.5s ease",
    }}>
      {/* Sidebar */}
      <div style={{
        width: "240px", minHeight: "100vh", flexShrink: 0,
        background: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.3)",
        display: "flex", flexDirection: "column",
        padding: "24px 16px",
        position: "sticky", top: 0, height: "100vh",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px", padding: "0 8px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px",
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", boxShadow: theme.shadow,
          }}>💰</div>
          <div>
            <div style={{ fontWeight: "800", color: theme.text, fontSize: "0.95rem" }}>ExpenseTracker</div>
            <div style={{ fontSize: "0.7rem", color: theme.subtext }}>{theme.greeting}</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {sidebarItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "12px",
              padding: "12px 16px", borderRadius: "12px", border: "none",
              background: activeSection === item.id ? `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}22)` : "transparent",
              color: activeSection === item.id ? theme.primary : theme.subtext,
              fontWeight: activeSection === item.id ? "700" : "500",
              cursor: "pointer", marginBottom: "4px",
              fontSize: "0.9rem", textAlign: "left",
              borderLeft: activeSection === item.id ? `3px solid ${theme.primary}` : "3px solid transparent",
              transition: "all 0.2s",
            }}>
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{
          background: "rgba(255,255,255,0.4)", borderRadius: "16px",
          padding: "16px", marginBottom: "12px",
          border: "1px solid rgba(255,255,255,0.5)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: "700", fontSize: "0.9rem",
            }}>
              {userName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "700", color: theme.text, fontSize: "0.85rem" }}>{userName}</div>
              <div style={{ fontSize: "0.7rem", color: theme.subtext }}>Free Account</div>
            </div>
          </div>
        </div>

        <button onClick={() => { localStorage.clear(); navigate("/"); }} style={{
          width: "100%", padding: "11px", borderRadius: "12px",
          border: `2px solid ${theme.primary}40`,
          background: "transparent", color: theme.primary,
          fontWeight: "700", cursor: "pointer", fontSize: "0.85rem",
        }}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "32px", overflow: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: theme.text }}>
              {activeSection === "dashboard" ? "Dashboard" : activeSection === "expenses" ? "My Expenses" : "Analytics"}
            </h1>
            <p style={{ margin: "4px 0 0", color: theme.subtext, fontSize: "0.9rem" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <label style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 20px", borderRadius: "14px",
              background: "rgba(255,255,255,0.7)",
              color: theme.primary, fontWeight: "700",
              cursor: scanning ? "not-allowed" : "pointer",
              fontSize: "0.9rem", boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              border: `2px solid ${theme.primary}40`,
              opacity: scanning ? 0.7 : 1,
            }}>
              {scanning ? "⏳ Scanning..." : "📸 Scan Receipt"}
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={handleImageUpload} disabled={scanning} />
            </label>
            <button onClick={() => {
              setShowForm(!showForm);
              setEditingExpense(null);
              setForm({ amount: "", description: "", category: "Food", expenseDate: new Date().toISOString().split("T")[0] });
            }} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "12px 24px", borderRadius: "14px", border: "none",
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              color: "#fff", fontWeight: "700", cursor: "pointer",
              fontSize: "0.9rem", boxShadow: `0 8px 24px ${theme.primary}40`,
            }}>
              {showForm ? "✕ Cancel" : "+ Add Expense"}
            </button>
          </div>
        </div>

        {/* Scanning Banner */}
        {scanning && (
          <div style={{
            background: `${theme.primary}15`, border: `2px solid ${theme.primary}40`,
            borderRadius: "16px", padding: "16px 24px", marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <span style={{ fontSize: "1.5rem" }}>🤖</span>
            <div>
              <div style={{ fontWeight: "700", color: theme.primary }}>AI is reading your receipt...</div>
              <div style={{ fontSize: "0.82rem", color: theme.subtext }}>Extracting amount, merchant and category automatically</div>
            </div>
          </div>
        )}

        {/* Stats Cards - show on all sections */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "28px" }}>
          {[
            { label: "Total Spending", value: `₹${totalSpending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: "💰", color: "#FF6B6B", change: `${filteredExpenses.length} transactions` },
            { label: "Average Expense", value: `₹${avgSpending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: "📊", color: "#4ECDC4", change: "per transaction" },
            { label: "Top Category", value: topCategory ? topCategory[0] : "N/A", icon: topCategory ? CATEGORY_ICONS[topCategory[0]] || "📦" : "🏆", color: "#45B7D1", change: topCategory ? `₹${topCategory[1].toLocaleString("en-IN")}` : "No data" },
            { label: "This Period", value: filteredExpenses.length, icon: "📋", color: "#FFA07A", change: "total entries" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
              borderRadius: "20px", padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.7)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${stat.color}20`, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
                }}>{stat.icon}</div>
                <span style={{
                  background: `${stat.color}20`, color: stat.color,
                  padding: "4px 10px", borderRadius: "20px",
                  fontSize: "0.7rem", fontWeight: "700",
                }}>{stat.change}</span>
              </div>
              <div style={{ color: theme.subtext, fontSize: "0.78rem", fontWeight: "600", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {stat.label}
              </div>
              <div style={{ color: theme.text, fontSize: "1.5rem", fontWeight: "800" }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div ref={formRef} style={{
            background: "rgba(255,255,255,0.7)", backdropFilter: "blur(20px)",
            borderRadius: "20px", padding: "28px", marginBottom: "28px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}>
            <h3 style={{ color: theme.text, marginTop: 0, marginBottom: "24px", fontSize: "1.2rem", fontWeight: "800" }}>
              {editingExpense ? "✏️ Edit Expense" : "➕ Add New Expense"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                <div>
                  <label style={{ color: theme.text, fontSize: "0.82rem", fontWeight: "700" }}>Amount (₹)</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>
                <div>
                  <label style={{ color: theme.text, fontSize: "0.82rem", fontWeight: "700" }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: theme.text, fontSize: "0.82rem", fontWeight: "700" }}>Date</label>
                  <input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                    required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>
                <div>
                  <label style={{ color: theme.text, fontSize: "0.82rem", fontWeight: "700" }}>Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What did you spend on?" style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>
              </div>
              <button type="submit" style={{
                marginTop: "20px", padding: "13px 32px", borderRadius: "12px", border: "none",
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "0.95rem",
                boxShadow: `0 8px 24px ${theme.primary}40`,
              }}>
                {editingExpense ? "✓ Update Expense" : "✓ Add Expense"}
              </button>
            </form>
          </div>
        )}

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {[["all", "All Time"], ["7", "Last 7 Days"], ["30", "Last 30 Days"], ["60", "Last 2 Months"]].map(([val, label]) => (
            <button key={val} onClick={() => setFilterDays(val)} style={{
              padding: "9px 20px", borderRadius: "20px", border: "none",
              background: filterDays === val ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : "rgba(255,255,255,0.6)",
              color: filterDays === val ? "#fff" : theme.subtext,
              cursor: "pointer", fontWeight: "700", fontSize: "0.82rem",
              boxShadow: filterDays === val ? `0 4px 16px ${theme.primary}40` : "none",
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
        </div>

        {/* ========== DASHBOARD SECTION ========== */}
        {activeSection === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {Object.keys(categoryTotals).length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
                borderRadius: "20px", padding: "24px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                border: "1px solid rgba(255,255,255,0.7)",
              }}>
                <h3 style={{ color: theme.text, marginTop: 0, marginBottom: "20px", fontSize: "1rem", fontWeight: "800" }}>
                  📊 Spending by Category
                </h3>
                {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                  const pct = Math.round((amount / totalSpending) * 100);
                  return (
                    <div key={cat} style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.text, fontWeight: "600", fontSize: "0.85rem" }}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </span>
                        <span style={{ color: theme.primary, fontWeight: "700", fontSize: "0.85rem" }}>
                          ₹{amount.toLocaleString("en-IN")} <span style={{ color: theme.subtext, fontWeight: "500" }}>({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: "6px", width: `${pct}%`,
                          background: `linear-gradient(90deg, ${CATEGORY_COLORS[cat] || theme.primary}, ${theme.secondary})`,
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{
              background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
              borderRadius: "20px", padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.7)",
              gridColumn: Object.keys(categoryTotals).length === 0 ? "1 / -1" : "auto",
            }}>
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: "20px", fontSize: "1rem", fontWeight: "800" }}>
                📋 Recent Transactions
              </h3>
              {filteredExpenses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>💸</div>
                  <div style={{ color: theme.subtext, fontWeight: "600" }}>No expenses yet!</div>
                </div>
              ) : (
                filteredExpenses.slice(0, 5).sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)).map((expense) => (
                  <div key={expense.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", marginBottom: "8px",
                    background: "rgba(255,255,255,0.7)", borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.8)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        background: `${CATEGORY_COLORS[expense.category?.name] || "#ddd"}25`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                      }}>
                        {CATEGORY_ICONS[expense.category?.name] || "📦"}
                      </div>
                      <div>
                        <div style={{ color: theme.text, fontWeight: "700", fontSize: "0.85rem" }}>
                          {expense.description || expense.category?.name}
                        </div>
                        <div style={{ color: theme.subtext, fontSize: "0.72rem" }}>
                          {new Date(expense.expenseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: theme.primary, fontWeight: "800" }}>
                      ₹{parseFloat(expense.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
              {filteredExpenses.length > 5 && (
                <p onClick={() => setActiveSection("expenses")} style={{
                  textAlign: "center", color: theme.primary, fontWeight: "700",
                  cursor: "pointer", marginTop: "12px", fontSize: "0.85rem",
                }}>
                  View all {filteredExpenses.length} transactions →
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== EXPENSES SECTION ========== */}
        {activeSection === "expenses" && (
          <div style={{
            background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
            borderRadius: "20px", padding: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}>
            <h3 style={{ color: theme.text, marginTop: 0, marginBottom: "20px", fontSize: "1rem", fontWeight: "800" }}>
              💳 All Transactions
            </h3>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: theme.subtext }}>Loading...</div>
            ) : filteredExpenses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>💸</div>
                <div style={{ color: theme.subtext, fontWeight: "600" }}>No expenses found</div>
                <div style={{ color: theme.subtext, fontSize: "0.85rem", marginTop: "4px" }}>Add your first expense to get started!</div>
              </div>
            ) : (
              filteredExpenses.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate)).map((expense) => (
                <div key={expense.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", marginBottom: "8px",
                  background: "rgba(255,255,255,0.7)", borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.8)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "12px",
                      background: `${CATEGORY_COLORS[expense.category?.name] || "#ddd"}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.2rem", flexShrink: 0,
                    }}>
                      {CATEGORY_ICONS[expense.category?.name] || "📦"}
                    </div>
                    <div>
                      <div style={{ color: theme.text, fontWeight: "700", fontSize: "0.9rem" }}>
                        {expense.description || expense.category?.name}
                      </div>
                      <div style={{ color: theme.subtext, fontSize: "0.75rem", marginTop: "2px" }}>
                        {new Date(expense.expenseDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {" • "}{expense.category?.name}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: theme.text, fontWeight: "800", fontSize: "1rem" }}>
                      ₹{parseFloat(expense.amount).toLocaleString("en-IN")}
                    </span>
                    <button onClick={() => handleEdit(expense)} style={{
                      background: "#FFF9C4", border: "none", padding: "6px 12px",
                      borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem",
                      fontWeight: "700", color: "#856404",
                    }}>✏️</button>
                    <button onClick={() => handleDelete(expense.id)} style={{
                      background: "#FFEBEE", border: "none", padding: "6px 12px",
                      borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem",
                      fontWeight: "700", color: "#C62828",
                    }}>🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== ANALYTICS SECTION ========== */}
        {activeSection === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Full Category Breakdown */}
            <div style={{
              background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
              borderRadius: "20px", padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.7)",
            }}>
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: "20px", fontSize: "1rem", fontWeight: "800" }}>
                📊 Full Category Breakdown
              </h3>
              {Object.keys(categoryTotals).length === 0 ? (
                <p style={{ textAlign: "center", color: theme.subtext }}>No data yet. Add some expenses!</p>
              ) : (
                Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => {
                  const pct = Math.round((amount / totalSpending) * 100);
                  return (
                    <div key={cat} style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.text, fontWeight: "700", fontSize: "0.95rem" }}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </span>
                        <span style={{ color: theme.primary, fontWeight: "800", fontSize: "0.95rem" }}>
                          ₹{amount.toLocaleString("en-IN")} ({pct}%)
                        </span>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.08)", borderRadius: "8px", height: "12px", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: "8px", width: `${pct}%`,
                          background: `linear-gradient(90deg, ${CATEGORY_COLORS[cat] || theme.primary}, ${theme.secondary})`,
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Spending Summary */}
            <div style={{
              background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)",
              borderRadius: "20px", padding: "24px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              border: "1px solid rgba(255,255,255,0.7)",
            }}>
              <h3 style={{ color: theme.text, marginTop: 0, marginBottom: "20px", fontSize: "1rem", fontWeight: "800" }}>
                📅 Spending Summary
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Total Spent", value: `₹${totalSpending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: "💰" },
                  { label: "Avg per Transaction", value: `₹${avgSpending.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: "📊" },
                  { label: "Total Transactions", value: filteredExpenses.length, icon: "🔢" },
                  { label: "Categories Used", value: Object.keys(categoryTotals).length, icon: "🏷️" },
                  { label: "Highest Expense", value: filteredExpenses.length > 0 ? `₹${Math.max(...filteredExpenses.map(e => parseFloat(e.amount))).toLocaleString("en-IN")}` : "N/A", icon: "📈" },
                  { label: "Lowest Expense", value: filteredExpenses.length > 0 ? `₹${Math.min(...filteredExpenses.map(e => parseFloat(e.amount))).toLocaleString("en-IN")}` : "N/A", icon: "📉" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.7)", borderRadius: "14px",
                    padding: "16px", textAlign: "center",
                    border: "1px solid rgba(255,255,255,0.8)",
                  }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{item.icon}</div>
                    <div style={{ color: theme.subtext, fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>{item.label}</div>
                    <div style={{ color: theme.primary, fontSize: "1.1rem", fontWeight: "800" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}