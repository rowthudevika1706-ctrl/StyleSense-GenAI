import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Sparkles } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.signup({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success("Welcome to StyleSense AI!");
      navigate("/style");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

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
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Your AI personal stylist awaits</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Your name" {...f("name")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com" {...f("email")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters" {...f("password")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Repeat password" {...f("confirm")} required />
              </div>
              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <hr className="divider" style={{ margin: "24px 0", borderColor: "var(--border)" }} />

            <p style={{ textAlign: "center", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}