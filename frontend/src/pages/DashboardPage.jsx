import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Bookmark, Clock, MessageCircle, ArrowRight, User } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import MobileNav from "../components/dashboard/MobileNav";
import { useAuth } from "../context/AuthContext";
import { historyAPI, outfitAPI } from "../utils/api";
import SkinToneAvatar from "../components/dashboard/SkinToneAvatar";

const ClothesStandSvg = () => (
  <svg viewBox="0 0 200 160" style={{ width: "100%", maxHeight: "130px", overflow: "visible" }} fill="none">
    {/* Hanger bar stand */}
    <line x1="100" y1="20" x2="100" y2="150" stroke="var(--border)" strokeWidth="3" />
    <line x1="50" y1="150" x2="150" y2="150" stroke="var(--border)" strokeWidth="3" />
    <line x1="60" y1="35" x2="140" y2="35" stroke="var(--border)" strokeWidth="3" />
    
    {/* Small curved legs */}
    <path d="M 100 150 Q 75 155 50 150" stroke="var(--border)" strokeWidth="3" />
    <path d="M 100 150 Q 125 155 150 150" stroke="var(--border)" strokeWidth="3" />
    
    {/* Dress on hanger */}
    <path d="M 100 35 L 94 40 L 97 45 L 85 60 L 80 120 L 120 120 L 115 60 L 103 45 L 106 40 Z" fill="rgba(44, 94, 173, 0.12)" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 97 32 Q 100 28 103 32" stroke="var(--accent)" strokeWidth="2" fill="none" />
    
    {/* Hanger details */}
    <line x1="85" y1="60" x2="115" y2="60" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2" />
    <line x1="90" y1="80" x2="110" y2="80" stroke="var(--accent)" strokeWidth="1.5" />
    
    {/* Handbag */}
    <rect x="52" y="115" width="22" height="18" rx="3" fill="rgba(21, 145, 220, 0.08)" stroke="var(--accent-light)" strokeWidth="2" />
    <path d="M 57 115 Q 63 105 69 115" stroke="var(--accent-light)" strokeWidth="2" fill="none" />
    
    {/* Potted plant on side */}
    <path d="M 135 125 L 138 145 L 148 145 L 151 125 Z" fill="rgba(188,142,66,0.12)" stroke="var(--gold)" strokeWidth="2" />
    {/* Leaves */}
    <path d="M 143 125 C 143 110 135 105 135 105 C 135 105 145 110 143 125" fill="var(--success)" opacity="0.8" />
    <path d="M 143 125 C 143 112 151 107 151 107 C 151 107 145 112 143 125" fill="var(--success)" opacity="0.8" />
    <path d="M 143 125 C 143 115 143 98 143 98 C 143 98 147 115 143 125" fill="var(--success)" />
  </svg>
);

const STYLE_GALLERY = {
  Traditional: {
    Female: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600"
    ],
    Male: [
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600",
      "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=600",
      "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600"
    ],
    default: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600",
      "https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=600",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600"
    ]
  },
  Casual: {
    Female: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600"
    ],
    Male: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600"
    ],
    default: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600"
    ]
  },
  Formal: {
    Female: [
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=600",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=600"
    ],
    Male: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600",
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600"
    ],
    default: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600",
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=80&w=600",
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600"
    ]
  },
  default: {
    Female: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600"
    ],
    Male: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600"
    ],
    default: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=600"
    ]
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ history: 0, saved: 0 });
  const [recentHistory, setRecentHistory] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [hRes, sRes] = await Promise.all([
          historyAPI.getAll(5),
          outfitAPI.getSaved()
        ]);
        setStats({
          history: hRes.data.count,
          saved: sRes.data.saved_outfits.length
        });
        setRecentHistory(hRes.data.history || []);
        setSavedOutfits(sRes.data.saved_outfits || []);
      } catch {}
    };
    loadStats();
  }, []);

  const profile = user?.profile || {};
  const hasProfile = profile.skin_tone && profile.gender;

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const lastSession = recentHistory[0];

  // Best colors parsing
  const palette = lastSession?.color_palette;
  const getSkinPaletteFallback = (tone) => {
    if (tone === "Fair") return { colors: ["#FFB6C1", "#E6E6FA", "#F0F8FF"], names: "Pink · Lavender · Ice" };
    if (tone === "Medium") return { colors: ["#D2B48C", "#4682B4", "#2E8B57"], names: "Tan · Steel · Forest" };
    if (tone === "Olive") return { colors: ["#2C5EAD", "#0E131F", "#F7EDEB"], names: "Navy · Slate · Cream" };
    if (tone === "Deep" || tone === "Dark") return { colors: ["#FFD700", "#FF8C00", "#FF4500"], names: "Gold · Orange · Fire" };
    return { colors: ["#2C5EAD", "#1591DC", "#4BB8FA"], names: "Navy · Cobalt · Sky" };
  };
  const fallbackPalette = getSkinPaletteFallback(profile.skin_tone);
  const activeColors = palette ? [
    ...(palette.primary || []),
    ...(palette.secondary || [])
  ].slice(0, 3) : fallbackPalette.colors;
  const activeColorNames = palette?.primary?.length
    ? palette.primary.slice(0, 3).map(c => palette.color_names?.[c] || c).join(" · ")
    : fallbackPalette.names;

  // Completeness score
  const getStyleScore = () => {
    let score = 50;
    if (profile.skin_tone) score += 10;
    if (profile.gender) score += 10;
    if (profile.occasion) score += 10;
    if (profile.age) score += 10;
    if (profile.budget) score += 10;
    return score;
  };
  const styleScore = getStyleScore();

  // Dynamic Moodboard Selector
  const getMoodboardImages = () => {
    let styleKey = "default";
    const occasionPref = (profile.occasion || "").toLowerCase();
    
    if (occasionPref.includes("wed") || occasionPref.includes("fest")) {
      styleKey = "Traditional";
    } else if (occasionPref.includes("off") || occasionPref.includes("interv") || occasionPref.includes("form")) {
      styleKey = "Formal";
    } else {
      styleKey = "Casual";
    }
    
    const genderKey = (profile.gender === "Male" || profile.gender === "Female") ? profile.gender : "default";
    const cat = STYLE_GALLERY[styleKey] || STYLE_GALLERY["default"];
    return cat[genderKey] || cat["default"];
  };

  const moodboardImages = getMoodboardImages();

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MobileNav />
      <main className="main-content">
        {/* Dynamic banner matching mockup */}
        <div className="dashboard-banner">
          <div className="dashboard-banner-left">
            <h2 style={{ fontSize: "1.8rem", marginBottom: 8, fontWeight: 700 }}>
              {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: 20 }}>
              {hasProfile
                ? `Your AI stylist has curated fresh ${profile.occasion ? profile.occasion.toLowerCase() : "everyday"} looks based on your profile and ₹${profile.budget?.toLocaleString() || "2,000"} budget.`
                : "Welcome! Complete your style profile and let our AI curate outfit recommendations for you."}
            </p>
            <Link to="/style" className="btn btn-primary">
              <Sparkles size={16} /> Generate New Outfit
            </Link>
          </div>
          <div className="dashboard-banner-right">
            <ClothesStandSvg />
          </div>
        </div>

        {/* 4 compact stats cards */}
        <div className="dashboard-stats-grid">
          {/* Card 1: Best Colors */}
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-title">Best Colors</div>
            <div>
              <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                {activeColors.map(c => (
                  <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c, border: "1px solid var(--border)" }} title={c} />
                ))}
              </div>
            </div>
            <div className="dashboard-stat-subtext" style={{ textTransform: "capitalize" }}>
              {activeColorNames}
            </div>
          </div>

          {/* Card 2: Age */}
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-title">Age</div>
            <div className="dashboard-stat-value" style={{ fontSize: "1.1rem" }}>
              {profile.age ? `${profile.age} years` : "Not set"}
            </div>
            <div className="dashboard-stat-subtext">
              {profile.occasion ? `${profile.occasion} Wear` : "Complete profile"}
            </div>
          </div>

          {/* Card 3: Style Score */}
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-title">Style Score</div>
            <div className="dashboard-stat-value" style={{ color: "var(--accent)" }}>
              {styleScore}/100
            </div>
            <div className="dashboard-stat-subtext">
              {styleScore >= 90 ? "Perfect match!" : styleScore >= 70 ? "Great match!" : "Complete profile"}
            </div>
          </div>

          {/* Card 4: Outfits Generated */}
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-title">Outfits Generated</div>
            <div className="dashboard-stat-value">
              {stats.history * 3}
            </div>
            <div className="dashboard-stat-subtext">
              Keep exploring!
            </div>
          </div>
        </div>

        {/* Two-Column split layout for bottom section */}
        <div className="dashboard-split-layout">
          {/* Left Column: Moodboard & Saved Outfits */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Dynamic Moodboard Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Your Style Moodboard</h3>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {profile.occasion || "Personalized"} Vibe
                </span>
              </div>
              <div className="grid-outfits">
                {moodboardImages.map((imgUrl, idx) => (
                  <div key={idx} className="card" style={{ padding: 0, overflow: "hidden", height: "240px", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", position: "relative" }}>
                    <img
                      src={imgUrl}
                      alt={`${profile.style_preference || "Style"} Moodboard ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", bottom: 0, insetX: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)", padding: "12px 16px", color: "white", fontSize: "0.8rem", width: "100%" }}>
                      ✦ {profile.occasion || "Style"} Inspired Look
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Outfits - Compact Lightweight List Layout */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Saved Outfits</h3>
                <Link to="/saved" style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 500 }}>View all</Link>
              </div>
              {savedOutfits.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {savedOutfits.slice(0, 3).map((outfit, i) => (
                    <div key={i} className="card" style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{outfit.name}</span>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>{outfit.budget_tier}</div>
                      </div>
                      <Link to="/saved" className="btn btn-outline btn-sm">
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card" style={{ padding: "32px", textAlign: "center", borderStyle: "dashed" }}>
                  <Bookmark size={32} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
                  <h4 style={{ marginBottom: 6 }}>No saved outfits yet</h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Save outfits you generate to see them here.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Style Profile card */}
          <div>
            <div className="card" style={{ position: "sticky", top: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>Your Style Profile</h3>
                <Link to="/profile" style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 500 }}>Edit</Link>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
                <SkinToneAvatar skinTone={profile.skin_tone} size={80} />
                <div>
                  <h4 style={{ fontSize: "1.1rem", marginBottom: 4 }}>{user?.name}</h4>
                  <span className="badge badge-gold" style={{ textTransform: "capitalize" }}>
                    {profile.skin_tone || "Not set"} tone
                  </span>
                </div>
                
                <hr style={{ width: "100%", borderColor: "var(--border)", margin: "8px 0" }} />
                
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Gender</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{profile.gender || "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Preferred Occasion</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{profile.occasion || "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Age</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{profile.age || "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>Budget Limit</span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      {profile.budget ? `₹${profile.budget.toLocaleString()}` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}