import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getExpenses, addExpense, deleteExpense, updateExpense } from "../services/api";
import { getTheme } from "../utils/timeTheme";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];

const menuItemStyle = {
  width: "100%",
  padding: "12px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: "600"
};

export default function Dashboard() {
  const [theme, setTheme] = useState(getTheme());
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "Food",
    expenseDate: new Date().toISOString().split("T")[0]
  });

  const formRef = useRef(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!userId) navigate("/");
    fetchExpenses();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const expenseData = {
      user: { id: parseInt(userId) },
      category: { name: form.category },
      amount: parseFloat(form.amount),
      description: form.description,
      expenseDate: form.expenseDate
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
  };

  const handleDelete = async (id) => {
    await deleteExpense(id);
    fetchExpenses();
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      amount: expense.amount,
      description: expense.description,
      category: expense.category?.name,
      expenseDate: expense.expenseDate
    });
    setShowForm(true);
  };

  const sidebarItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "expenses", icon: "💳", label: "Expenses" },
    { id: "profile", icon: "👤", label: "Profile" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: theme.background }}>

      {/* SIDEBAR */}
      <div style={{
        width: "240px",
        background: "rgba(255,255,255,0.2)",
        padding: "20px",
        display: "flex",
        flexDirection: "column"
      }}>
        <h2>💰 ExpenseTracker</h2>

        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            style={{
              padding: "12px",
              marginBottom: "10px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: activeSection === item.id ? theme.primary : "transparent",
              color: activeSection === item.id ? "#fff" : "#333"
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}

        {/* PROFILE DROPDOWN */}
        <div style={{ marginTop: "auto", position: "relative" }}>
          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ cursor: "pointer", padding: "10px", background: "#fff", borderRadius: "10px" }}
          >
            👤 {userName}
          </div>

          {showProfileMenu && (
            <div style={{
              position: "absolute",
              bottom: "50px",
              width: "100%",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.2)"
            }}>
              <button style={menuItemStyle} onClick={() => setActiveSection("profile")}>👤 Profile</button>
              <button style={menuItemStyle}>🔑 Change Password</button>
              <button
                style={{ ...menuItemStyle, color: "red" }}
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "30px" }}>

        {/* DASHBOARD */}
        {activeSection === "dashboard" && (
          <>
            <h2>📊 Dashboard</h2>
            <p>Total Expenses: {expenses.length}</p>
          </>
        )}

        {/* EXPENSES */}
        {activeSection === "expenses" && (
          <>
            <h2>💳 Expenses</h2>

            <button onClick={() => setShowForm(!showForm)}>+ Add Expense</button>

            {showForm && (
              <form onSubmit={handleSubmit} ref={formRef}>
                <input placeholder="Amount" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} />

                <input placeholder="Description" value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />

                <button type="submit">Save</button>
              </form>
            )}

            {expenses.map(exp => (
              <div key={exp.id}>
                {exp.description} - ₹{exp.amount}
                <button onClick={() => handleEdit(exp)}>Edit</button>
                <button onClick={() => handleDelete(exp.id)}>Delete</button>
              </div>
            ))}
          </>
        )}

        {/* PROFILE */}
        {activeSection === "profile" && (
          <div>
            <h2>👤 Profile</h2>
            <p>Name: {userName}</p>
            <p>User ID: {userId}</p>

            <button>🔑 Change Password</button>
          </div>
        )}

      </div>
    </div>
  );
}