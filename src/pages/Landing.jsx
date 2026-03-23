import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { getTheme } from "../utils/timeTheme";
import axios from "axios";

const API = "http://localhost:8080/api/auth";

const getPasswordStrength = (password) => {
  let strength = 0;
  let tips = [];
  if (password.length >= 8) strength++; else tips.push("at least 8 characters");
  if (/[A-Z]/.test(password)) strength++; else tips.push("one uppercase letter");
  if (/[0-9]/.test(password)) strength++; else tips.push("one number");
  if (/[^A-Za-z0-9]/.test(password)) strength++; else tips.push("one special character (!@#$)");
  const levels = [
    { label: "Very Weak", color: "#E53E3E", bg: "#FED7D7" },
    { label: "Weak", color: "#DD6B20", bg: "#FEEBC8" },
    { label: "Good", color: "#D69E2E", bg: "#FEFCBF" },
    { label: "Strong 💪", color: "#38A169", bg: "#C6F6D5" },
  ];
  return { strength, tips, level: levels[strength - 1] || levels[0] };
};

export default function Landing() {
  const [theme, setTheme] = useState(getTheme());
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setTheme(getTheme()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const { strength } = getPasswordStrength(password);
    if (strength < 3) {
      setError("Please set a stronger password before continuing!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/send-otp`, { email });
      setStep(2);
      setTimer(300);
      setSuccess(`OTP sent to ${email}! Check your inbox.`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/register`, { name, email, password, otp });
      setSuccess("✅ Registered successfully! Please login.");
      setIsLogin(true);
      setStep(1);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = () => {
    const m = Math.floor(timer / 60);
    const s = timer % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const features = [
    { icon: "📊", title: "Smart Analytics", desc: "Track spending patterns visually" },
    { icon: "🏷️", title: "Categories", desc: "Organize by Food, Bills, Transport & more" },
    { icon: "📅", title: "Date Filters", desc: "View expenses by week, month or custom" },
    { icon: "🤖", title: "AI Receipt Scan", desc: "Upload screenshot and auto-fill expense" },
  ];

  const inputStyle = {
    width: "100%", padding: "14px 16px", borderRadius: "12px",
    border: "2px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.8)", fontSize: "0.95rem",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const PasswordStrength = () => {
    if (!password) return null;
    const { strength, tips, level } = getPasswordStrength(password);
    return (
      <div style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              flex: 1, height: "5px", borderRadius: "4px",
              background: i < strength ? ["#E53E3E", "#DD6B20", "#D69E2E", "#38A169"][i] : "rgba(0,0,0,0.1)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{
            fontSize: "0.78rem", fontWeight: "700", color: level.color,
            background: level.bg, padding: "2px 10px", borderRadius: "20px",
          }}>
            {level.label}
          </span>
          {strength === 4 && <span style={{ fontSize: "0.78rem", color: "#38A169" }}>✅ Great password!</span>}
        </div>
        {tips.length > 0 && (
          <div style={{
            background: "rgba(0,0,0,0.04)", borderRadius: "8px",
            padding: "8px 12px", fontSize: "0.78rem", color: theme.subtext,
          }}>
            💡 Add: {tips.join(", ")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh", background: theme.background,
      fontFamily: "'Segoe UI', sans-serif", transition: "all 1.5s ease",
    }}>
      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
        padding: "16px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: theme.buttonBg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.2rem", boxShadow: theme.shadow,
          }}>💰</div>
          <span style={{ fontSize: "1.3rem", fontWeight: "800", color: theme.text }}>
            ExpenseTracker
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>{theme.icon}</span>
          <span style={{ color: theme.subtext, fontSize: "0.9rem", fontWeight: "500" }}>
            {theme.greeting}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh", paddingTop: "72px",
      }}>
        {/* Left Side */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "60px 48px",
          ...theme.loginPosition,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.3)", borderRadius: "20px",
            padding: "6px 16px", marginBottom: "24px", width: "fit-content",
            border: "1px solid rgba(255,255,255,0.4)",
          }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700",
              color: theme.primary, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              ✨ Smart Finance Tracker
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: "900",
            color: theme.text, lineHeight: 1.15, marginBottom: "20px",
            letterSpacing: "-0.02em",
          }}>
            Take Control of<br />
            <span style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", display: "inline-block", color: "transparent",
            }}>
              Your Finances
            </span>
          </h1>

          <p style={{
            fontSize: "1.1rem", color: theme.subtext, lineHeight: 1.7,
            marginBottom: "40px", maxWidth: "420px",
          }}>
            Track expenses, analyze spending patterns, and make smarter financial decisions — all in one beautiful app.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "480px" }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.4)", backdropFilter: "blur(10px)",
                borderRadius: "16px", padding: "16px",
                border: "1px solid rgba(255,255,255,0.5)",
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{f.icon}</div>
                <div style={{ fontWeight: "700", color: theme.text, fontSize: "0.85rem", marginBottom: "4px" }}>{f.title}</div>
                <div style={{ color: theme.subtext, fontSize: "0.75rem", lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{
            width: "100%", maxWidth: "440px",
            background: "rgba(255,255,255,0.7)", backdropFilter: "blur(30px)",
            borderRadius: "28px", padding: "44px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.12)",
            border: "1px solid rgba(255,255,255,0.8)",
          }}>
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: theme.text, marginBottom: "8px" }}>
                {isLogin ? "Welcome back! 👋" : step === 1 ? "Get started ✨" : "Verify Email 📧"}
              </h2>
              <p style={{ color: theme.subtext, fontSize: "0.9rem" }}>
                {isLogin ? "Sign in to your account" : step === 1 ? "Create your free account today" : `Enter the OTP sent to ${email}`}
              </p>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", background: "rgba(0,0,0,0.06)",
              borderRadius: "12px", padding: "4px", marginBottom: "28px",
            }}>
              {["Login", "Register"].map((tab, i) => (
                <button key={tab} onClick={() => { setIsLogin(i === 0); setError(""); setSuccess(""); setStep(1); setPassword(""); }} style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "10px",
                  fontWeight: "700", fontSize: "0.9rem", cursor: "pointer",
                  transition: "all 0.3s",
                  background: (i === 0) === isLogin ? "#fff" : "transparent",
                  color: (i === 0) === isLogin ? theme.primary : theme.subtext,
                  boxShadow: (i === 0) === isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                }}>{tab}</button>
              ))}
            </div>

            {/* Messages */}
            {error && (
              <div style={{
                background: "#FFF5F5", border: "1px solid #FEB2B2",
                color: "#C53030", padding: "12px 16px", borderRadius: "12px",
                marginBottom: "20px", fontSize: "0.85rem", fontWeight: "500",
              }}>⚠️ {error}</div>
            )}
            {success && (
              <div style={{
                background: "#F0FFF4", border: "1px solid #9AE6B4",
                color: "#276749", padding: "12px 16px", borderRadius: "12px",
                marginBottom: "20px", fontSize: "0.85rem", fontWeight: "500",
              }}>✅ {success}</div>
            )}

            {/* LOGIN FORM */}
            {isLogin && (
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>
                <div style={{ marginBottom: "28px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "15px", borderRadius: "14px", border: "none",
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  color: "#fff", fontSize: "1rem", fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                  boxShadow: `0 8px 24px ${theme.primary}40`,
                }}>
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
              </form>
            )}

            {/* REGISTER STEP 1 - Details */}
            {!isLogin && step === 1 && (
              <form onSubmit={handleSendOTP}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                  <PasswordStrength />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "15px", borderRadius: "14px", border: "none",
                  marginTop: "20px",
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  color: "#fff", fontSize: "1rem", fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                  boxShadow: `0 8px 24px ${theme.primary}40`,
                }}>
                  {loading ? "Sending OTP..." : "Send OTP →"}
                </button>
              </form>
            )}

            {/* REGISTER STEP 2 - OTP */}
            {!isLogin && step === 2 && (
              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                  <div style={{
                    width: "70px", height: "70px", borderRadius: "50%", margin: "0 auto 16px",
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem",
                  }}>📧</div>
                  <p style={{ color: theme.subtext, fontSize: "0.9rem" }}>
                    We sent a 6-digit OTP to<br />
                    <strong style={{ color: theme.text }}>{email}</strong>
                  </p>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontWeight: "600", color: theme.text, fontSize: "0.85rem", marginBottom: "8px" }}>
                    Enter OTP
                  </label>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP" maxLength={6} required
                    style={{ ...inputStyle, textAlign: "center", fontSize: "1.5rem", letterSpacing: "0.5em", fontWeight: "700" }}
                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                    onBlur={(e) => e.target.style.borderColor = "rgba(0,0,0,0.08)"} />
                </div>

                {timer > 0 && (
                  <p style={{ textAlign: "center", color: theme.subtext, fontSize: "0.85rem", marginBottom: "16px" }}>
                    OTP expires in <strong style={{ color: timer < 60 ? "#C53030" : theme.primary }}>{formatTimer()}</strong>
                  </p>
                )}

                {timer === 0 && (
                  <p style={{ textAlign: "center", fontSize: "0.85rem", marginBottom: "16px" }}>
                    OTP expired!{" "}
                    <span onClick={() => { setStep(1); setOtp(""); setError(""); setSuccess(""); }}
                      style={{ color: theme.primary, fontWeight: "700", cursor: "pointer" }}>
                      Resend OTP
                    </span>
                  </p>
                )}

                <button type="submit" disabled={loading || timer === 0} style={{
                  width: "100%", padding: "15px", borderRadius: "14px", border: "none",
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  color: "#fff", fontSize: "1rem", fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading || timer === 0 ? 0.7 : 1,
                  boxShadow: `0 8px 24px ${theme.primary}40`,
                }}>
                  {loading ? "Verifying..." : "Verify & Create Account →"}
                </button>

                <p onClick={() => { setStep(1); setOtp(""); setError(""); }}
                  style={{ textAlign: "center", marginTop: "16px", color: theme.primary, cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>
                  ← Change Email
                </p>
              </form>
            )}

            {isLogin && (
              <p style={{ textAlign: "center", marginTop: "24px", color: theme.subtext, fontSize: "0.85rem" }}>
                Don't have an account?{" "}
                <span onClick={() => { setIsLogin(false); setError(""); setSuccess(""); setPassword(""); }}
                  style={{ color: theme.primary, fontWeight: "700", cursor: "pointer" }}>
                  Register for free
                </span>
              </p>
            )}
            {!isLogin && step === 1 && (
              <p style={{ textAlign: "center", marginTop: "24px", color: theme.subtext, fontSize: "0.85rem" }}>
                Already have an account?{" "}
                <span onClick={() => { setIsLogin(true); setError(""); setSuccess(""); setPassword(""); }}
                  style={{ color: theme.primary, fontWeight: "700", cursor: "pointer" }}>
                  Sign in
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}