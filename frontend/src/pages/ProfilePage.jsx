import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import MobileNav from "../components/dashboard/MobileNav";
import { profileAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { User, Save } from "lucide-react";
import SkinToneAvatar from "../components/dashboard/SkinToneAvatar";

const OCCASIONS = ["Casual", "College", "Office", "Party", "Formal", "Wedding"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const profile = user?.profile || {};

  const [form, setForm] = useState({
    gender: profile.gender || "",
    occasion: profile.occasion || "",
    age: profile.age || "",
    budget: profile.budget || 2000,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: form.age !== "" && form.age !== null ? parseInt(form.age) : null
      };
      await profileAPI.update(payload);
      await refreshUser();
      toast.success("Profile updated!");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const Chip = ({ value, selected, onClick }) => (
    <button
      className={`chip ${selected ? "selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      {value}
    </button>
  );

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MobileNav />
      <main className="main-content">
        <div className="page-header">
          <h2>Your Profile</h2>
          <p>Manage your style preferences to improve recommendations.</p>
        </div>

        {/* Account info */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <SkinToneAvatar skinTone={profile.skin_tone} size={56} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{user?.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user?.email}</div>
            </div>
          </div>

          {profile.skin_tone && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {profile.skin_hex && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: profile.skin_hex, border: "2px solid var(--border)" }} />
              )}
              <span style={{ fontSize: "0.85rem" }}>
                Skin tone: <strong>{profile.skin_tone}</strong>
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                (detected via photo analysis)
              </span>
            </div>
          )}
        </div>

        {/* Style preferences */}
        <div className="card">
          <h3 style={{ marginBottom: 24 }}>Style Preferences</h3>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="chip-group">
              {GENDERS.map((g) => (
                <Chip key={g} value={g} selected={form.gender === g} onClick={() => setForm({ ...form, gender: g })} />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Occasion</label>
            <div className="chip-group">
              {OCCASIONS.map((o) => (
                <Chip key={o} value={o} selected={form.occasion === o} onClick={() => setForm({ ...form, occasion: o })} />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              className="form-input"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              min={1}
              max={120}
              placeholder="Enter your age"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Budget (₹)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {[500, 1000, 2000, 5000, 10000].map((b) => (
                <Chip key={b} value={`₹${b.toLocaleString()}`} selected={form.budget === b} onClick={() => setForm({ ...form, budget: b })} />
              ))}
            </div>
            <input
              className="form-input"
              type="number"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: parseInt(e.target.value) || 0 })}
              min={100}
              placeholder="Custom amount"
            />
          </div>

          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>

        {/* Past preferences */}
        {user?.past_preferences?.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Recent Style History</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {user.past_preferences.slice(-10).reverse().map((p, i) => (
                <span key={i} className="badge badge-purple" style={{ fontSize: "0.78rem" }}>{p}</span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}