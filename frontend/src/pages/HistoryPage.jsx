import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import MobileNav from "../components/dashboard/MobileNav";
import { historyAPI } from "../utils/api";
import { Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import OutfitCard from "../components/outfit/OutfitCard";
import ColorPalette from "../components/outfit/ColorPalette";
import toast from "react-hot-toast";

function HistoryItem({ rec }) {
  const [expanded, setExpanded] = useState(false);
  const [paletteModalOpen, setPaletteModalOpen] = useState(false);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {rec.skin_hex && (
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: rec.skin_hex, border: "1px solid var(--border)", alignSelf: "center" }} />
            )}
            <span className="badge badge-purple">{rec.preferences?.occasion}</span>
            <span className="badge badge-gold">{rec.preferences?.style_preference}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", alignSelf: "center" }}>
              ₹{rec.preferences?.budget} · {rec.preferences?.gender}
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {new Date(rec.created_at).toLocaleString("en-IN")} ·{" "}
            {rec.outfits?.length || 0} outfit{rec.outfits?.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            {rec.overall_advice ? (
              <div style={{
                flex: 1,
                padding: "12px 16px",
                background: "rgba(36, 94, 173, 0.06)",
                borderRadius: "var(--radius)",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                borderLeft: "3px solid var(--accent)"
              }}>
                <span style={{ color: "var(--accent)", fontWeight: 600, marginRight: 6 }}>✦ Style Advice:</span>
                {rec.overall_advice}
              </div>
            ) : <div />}
            {rec.color_palette && (
              <button className="btn btn-outline btn-sm" onClick={() => setPaletteModalOpen(true)}>
                View Color Palette
              </button>
            )}
          </div>

          <div className="grid-outfits" style={{ marginTop: 16 }}>
            {rec.outfits?.map((outfit, i) => (
              <OutfitCard key={i} outfit={outfit} />
            ))}
          </div>

          {paletteModalOpen && rec.color_palette && (
            <div className="modal-overlay" onClick={() => setPaletteModalOpen(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setPaletteModalOpen(false)}>
                  <X size={20} />
                </button>
                <div style={{ marginTop: 12 }}>
                  <ColorPalette
                    palette={rec.color_palette}
                    skinTone={rec.skin_tone}
                    skinHex={rec.skin_hex}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await historyAPI.getAll(30);
        setHistory(res.data.history || []);
      } catch {
        toast.error("Could not load history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MobileNav />
      <main className="main-content">
        <div className="page-header">
          <h2>Style History</h2>
          <p>All your past styling sessions and outfit recommendations.</p>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: "unset", height: 200 }}>
            <div className="spinner" />
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
            <h3>No history yet</h3>
            <p>Your styling sessions will appear here once you start getting recommendations.</p>
            <Link to="/style" className="btn btn-primary" style={{ marginTop: 20 }}>
              Get Your First Recommendation
            </Link>
          </div>
        ) : (
          <div>
            {history.map((rec) => (
              <HistoryItem key={rec._id} rec={rec} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}