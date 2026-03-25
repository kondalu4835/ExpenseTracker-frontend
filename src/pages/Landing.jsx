import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import axios from "axios";

const API = `${process.env.REACT_APP_API_URL || "http://localhost:8080/api"}/auth`;

const themes = {
  light: {
    background: "linear-gradient(135deg, #f8f4ff 0%, #e8f4fd 50%, #fef9f0 100%)",
    card: "rgba(255,255,255,0.85)",
    text: "#1a1a2e",
    subtext: "#64748b",
    primary: "#6c63ff",
    secondary: "#a78bfa",
    border: "rgba(108,99,255,0.15)",
    inputBg: "rgba(255,255,255,0.9)",
    featureBg: "rgba(255,255,255,0.6)",
    navBg: "rgba(255,255,255,0.7)",
    toggleBg: "#e2e8f0",
    toggleIcon: "🌙",
    toggleText: "Dark",
  },
  dark: {
    background: "linear-gradient(135deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)",
    card: "rgba(255,255,255,0.05)",
    text: "#f1f5f9",
    subtext: "#94a3b8",
    primary: "#a78bfa",
    secondary: "#7c3aed",
    border: "rgba(167,139,250,0.2)",
    inputBg: "rgba(255,255,255,0.07)",
    featureBg: "rgba(255,255,255,0.05)",
    navBg: "rgba(0,0,0,0.3)",
    toggleBg: "#334155",
    toggleIcon: "☀️",
    toggleText: "Light",
  }
};

const getPasswordStrength = (password) => {
  let strength = 0;
  let tips = [];
  if (password.length >= 8) strength++; else tips.push("at least 8 characters");
  if (/[A-Z]/.test(password)) strength++; else tips.push("one uppercase letter");
  if (/[0-9]/.test(password)) strength++; else tips.push("one number");
  if (/[^A-Za-z0-9]/.test(password)) strength++; else tips.push("one special character (!@#$)");
  const levels = [
    { label: "Very Weak", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { label: "Weak", color: "#f97316", bg: "rgba(249,115,22,0.1)" },
    { label: "Good", color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    { label: "Strong 💪", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  ];
  return { strength, tips, level: levels[strength - 1] || levels[0] };
};

export default function Landing() {
  const [mode, setMode] = useState(() => localStorage.getItem("theme") || "light");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = themes[mode];

  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  const toggleTheme = () => setMode(mode === "light" ? "dark" : "light");

  const handleRegister = async (e) => {
    e.preventDefault();
    const { strength } = getPasswordStrength(password);
    if (strength < 3) { setError("Please set a stronger password!"); return; }
    setLoading(true); setError("");
    try {
      await axios.post(`${API}/register`, { name, email, password });
      setSuccess("✅ Registered successfully! Please login.");
      setIsLogin(true);
      setName(""); setEmail(""); setPassword("");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: `2px solid ${theme.border}`,
    background: theme.inputBg,
    color: theme.text,
    fontSize: "0.95rem", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
    fontFamily: "'Inter', sans-serif",
  };

  const features = [
    { icon: "📊", title: "Smart Analytics", desc: "Track spending patterns visually" },
    { icon: "🏷️", title: "Categories", desc: "Organize by Food, Bills, Transport & more" },
    { icon: "📅", title: "Date Filters", desc: "View by week, month or custom range" },
    { icon: "🤖", title: "AI Receipt Scan", desc: "Upload & auto-fill expenses instantly" },
  ];

  const PasswordStrength = () => {
    if (!password) return null;
    const { strength, tips, level } = getPasswordStrength(password);
    return (
      <div style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ flex: 1, height: "4px", borderRadius: "4px", background: i < strength ? ["#ef4444","#f97316","#eab308","#22c55e"][i] : "rgba(128,128,128,0.2)", transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: level.color, background: level.bg, padding: "2px 10px", borderRadius: "20px" }}>
            {level.label}
          </span>
          {strength === 4 && <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>✅ Perfect!</span>}
        </div>
        {tips.length > 0 && (
          <div style={{ background: "rgba(128,128,128,0.08)", borderRadius: "8px", padding: "8px 12px", fontSize: "0.75rem", color: theme.subtext }}>
            💡 Add: {tips.join(", ")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.background, fontFamily: "'Inter', sans-serif", transition: "all 0.4s ease" }}>

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: theme.navBg, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${theme.border}`,
        padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>💰</div>
          <span style={{ fontSize: "1.4rem", fontFamily: "'DM Serif Display', serif", color: theme.text }}>ExpenseTracker</span>
        </div>

        {/* Theme Toggle */}
        <button onClick={toggleTheme} style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: theme.toggleBg, border: "none", borderRadius: "20px",
          padding: "8px 16px", cursor: "pointer", transition: "all 0.3s",
          color: theme.text, fontSize: "0.85rem", fontWeight: "600",
        }}>
          <span>{theme.toggleIcon}</span>
          <span>{theme.toggleText} Mode</span>
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", paddingTop: "72px" }}>

        {/* Left Side */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`, borderRadius: "20px", padding: "6px 16px", marginBottom: "24px", width: "fit-content", border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: theme.primary, letterSpacing: "0.1em", textTransform: "uppercase" }}>✨ Smart Finance Tracker</span>
          </div>

          <h1 style={{ fontSize: "clamp(2.5rem, 4vw, 3.8rem)", fontFamily: "'DM Serif Display', serif", color: theme.text, lineHeight: 1.15, marginBottom: "20px" }}>
            Take Control of<br />
            <span style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>
              Your Finances
            </span>
          </h1>

          <p style={{ fontSize: "1.1rem", color: theme.subtext, lineHeight: 1.7, marginBottom: "40px", maxWidth: "420px" }}>
            Track expenses, analyze spending patterns, and make smarter financial decisions — all in one beautiful app.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "480px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: theme.featureBg, backdropFilter: "blur(10px)", borderRadius: "16px", padding: "20px", border: `1px solid ${theme.border}`, transition: "all 0.3s" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{f.icon}</div>
                <div style={{ fontWeight: "700", color: theme.text, fontSize: "0.85rem", marginBottom: "4px", fontFamily: "'DM Serif Display', serif" }}>{f.title}</div>
                <div style={{ color: theme.subtext, fontSize: "0.75rem", lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: "440px", background: theme.card, backdropFilter: "blur(30px)", borderRadius: "28px", padding: "44px", boxShadow: mode === "light" ? "0 32px 64px rgba(0,0,0,0.1)" : "0 32px 64px rgba(0,0,0,0.4)", border: `1px solid ${theme.border}` }}>

            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "1.8rem", fontFamily: "'DM Serif Display', serif", color: theme.text, marginBottom: "8px" }}>
                {isLogin ? "Welcome back! 👋" : "Get started ✨"}
              </h2>
              <p style={{ color: theme.subtext, fontSize: "0.9rem" }}>
                {isLogin ? "Sign in to your account" : "Create your free account today"}
              </p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", background: mode === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", borderRadius: "12px", padding: "4px", marginBottom: "28px" }}>
              {["Login", "Register"].map((tab, i) => (
                <button key={tab} onClick={() => { setIsLogin(i === 0); setError(""); setSuccess(""); setPassword(""); }} style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "10px",
                  fontWeight: "700", fontSize: "0.9rem", cursor: "pointer", transition: "all 0.3s",
                  background: (i === 0) === isLogin ? (mode === "light" ? "#fff" : "rgba(255,255,255,0.1)") : "transparent",
                  color: (i === 0) === isLogin ? theme.primary : theme.subtext,
                  boxShadow: (i === 0) === isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                  fontFamily: "'Inter', sans-serif",
                }}>{tab}</button>
              ))}
            </div>

            {/* Messages */}
            {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.85rem", fontWeight: "500" }}>⚠️ {error}</div>}
            {success && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e", padding: "12px 16px", borderRadius: "12px", marginBottom: "20px", fontSize: "0.85rem", fontWeight: "500" }}>{success}</div>}

            {/* LOGIN */}
            {isLogin && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border} />
                </div>
                <div style={{ marginBottom: "28px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border} />
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: "14px", border: "none", background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, color: "#fff", fontSize: "1rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'Inter', sans-serif" }}>
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
                <p style={{ textAlign: "center", marginTop: "24px", color: theme.subtext, fontSize: "0.85rem" }}>
                  Don't have an account?{" "}
                  <span onClick={() => { setIsLogin(false); setError(""); setSuccess(""); setPassword(""); }} style={{ color: theme.primary, fontWeight: "700", cursor: "pointer" }}>Register for free</span>
                </p>
              </form>
            )}

            {/* REGISTER */}
            {!isLogin && (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border} />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = theme.border} />
                  <PasswordStrength />
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%", padding: "15px", borderRadius: "14px", border: "none", marginTop: "20px", background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, color: "#fff", fontSize: "1rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'Inter', sans-serif" }}>
                  {loading ? "Creating account..." : "Create Account →"}
                </button>
                <p style={{ textAlign: "center", marginTop: "24px", color: theme.subtext, fontSize: "0.85rem" }}>
                  Already have an account?{" "}
                  <span onClick={() => { setIsLogin(true); setError(""); setSuccess(""); setPassword(""); }} style={{ color: theme.primary, fontWeight: "700", cursor: "pointer" }}>Sign in</span>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}