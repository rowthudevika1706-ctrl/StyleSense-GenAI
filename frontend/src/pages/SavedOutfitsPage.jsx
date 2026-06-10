import React, { useEffect, useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import MobileNav from "../components/dashboard/MobileNav";
import OutfitCard from "../components/outfit/OutfitCard";
import { outfitAPI } from "../utils/api";
import { Bookmark, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SavedOutfitsPage() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await outfitAPI.getSaved();
      setOutfits(res.data.saved_outfits || []);
    } catch {
      toast.error("Could not load saved outfits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (name) => {
    try {
      await outfitAPI.deleteSaved(name);
      setOutfits((prev) => prev.filter((o) => o.name !== name));
      toast.success("Outfit removed");
    } catch {
      toast.error("Could not remove outfit");
    }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MobileNav />
      <main className="main-content">
        <div className="page-header">
          <h2>Saved Outfits</h2>
          <p>Your favourite outfit recommendations, saved for later.</p>
        </div>

        {loading ? (
          <div className="loading-screen" style={{ minHeight: "unset", height: 200 }}>
            <div className="spinner" />
          </div>
        ) : outfits.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={48} style={{ color: "var(--text-muted)", marginBottom: 16 }} />
            <h3>No saved outfits yet</h3>
            <p>When you get outfit recommendations, hit the bookmark icon to save them here.</p>
          </div>
        ) : (
          <div className="grid-outfits">
            {outfits.map((outfit, i) => (
              <div key={i} style={{ position: "relative" }}>
                <OutfitCard outfit={outfit} showSave={false} />
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  display: "flex", gap: 8, zIndex: 10
                }}>
                  {outfit.saved_at && (
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", alignSelf: "center", background: "var(--bg-card)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border)" }}>
                      {new Date(outfit.saved_at).toLocaleDateString("en-IN")}
                    </span>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(outfit.name)}
                    title="Remove"
                    style={{ padding: 6, borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}