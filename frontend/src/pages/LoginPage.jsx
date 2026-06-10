import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-split">
        {/* Left Column: Visual Banner */}
        <div
          className="auth-card-left"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1000')",
          }}
        >
          <div className="auth-card-left-content">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Sparkles size={36} style={{ color: "var(--accent-2)" }} />
              <h1 style={{ fontSize: "2.4rem", fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: "-0.01em" }}>StyleSense</h1>
            </div>
            <p style={{ fontSize: "1rem", opacity: 0.9, fontWeight: 300, lineHeight: 1.6, maxWidth: 360 }}>
              Elevate your everyday wardrobe with personalized AI outfit recommendations tailored to your unique skin tone and personal preferences.
            </p>
          </div>
        </div>

        {/* Right Column: Function Form */}
        <div className="auth-card-right">
          <div className="auth-card-form-wrapper">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                <Sparkles size={28} style={{ color: "var(--accent)" }} />
                <h1 style={{ fontSize: "1.8rem" }} className="gradient-text">StyleSense AI</h1>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Sign in to your style account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)"
                    }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <hr className="divider" style={{ margin: "24px 0", borderColor: "var(--border)" }} />

            <p style={{ textAlign: "center", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              New here?{" "}
              <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}