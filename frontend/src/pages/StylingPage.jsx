import React, { useState } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import MobileNav from "../components/dashboard/MobileNav";
import PhotoUploader from "../components/outfit/PhotoUploader";
import ColorPalette from "../components/outfit/ColorPalette";
import OutfitCard from "../components/outfit/OutfitCard";
import { outfitAPI } from "../utils/api";
import toast from "react-hot-toast";
import { Sparkles, ChevronRight, ChevronLeft, RefreshCw, X, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const OCCASIONS = ["Casual", "College", "Office", "Party", "Formal", "Wedding"];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

const MALE_CATEGORIES = [
  "Shirts/T-shirts",
  "Pants/Jeans",
  "Kurtas",
  "Sherwanis",
  "Nehru Jackets",
  "Ethnic Jackets",
  "Salwars",
  "Churidars",
  "Shoes",
  "Watch",
  "Belt",
  "Bag",
  "Sunglasses",
  "Accessories"
];

const FEMALE_CATEGORIES = [
  "Tops/Shirts",
  "Jeans/Trousers",
  "Skirt",
  "Kurtas/Kurtis",
  "Palazzos",
  "Salwars",
  "Churidars",
  "Dupattas",
  "Lehengas",
  "Sarees",
  "Blouses",
  "Anarkali Suits",
  "Ethnic Jackets",
  "Jacket/Shrug",
  "Footwear",
  "Handbag",
  "Watch",
  "Jewellery",
  "Sunglasses",
  "Accessories"
];

const SKIN_TONES = [
  { name: "Fair", hex: "#FDF6EE", desc: "Cool light skin with pink/peachy undertones" },
  { name: "Light", hex: "#F5D2B7", desc: "Warm light skin with yellow/golden undertones" },
  { name: "Medium", hex: "#DEB088", desc: "Neutral tan/medium skin with balanced undertones" },
  { name: "Olive", hex: "#C69068", desc: "Green/yellowish warm undertones, tan easily" },
  { name: "Tan", hex: "#825C43", desc: "Rich golden brown skin with warm undertones" },
  { name: "Deep", hex: "#4A3325", desc: "Deep brown/black skin with cool or warm undertones" }
];

const getCategoriesForGender = (gender) => {
  const g = (gender || "").toLowerCase();
  if (g.includes("male") && !g.includes("female")) {
    return MALE_CATEGORIES;
  }
  if (g.includes("female")) {
    return FEMALE_CATEGORIES;
  }
  // Merge lists for other genders
  return [...new Set([...MALE_CATEGORIES, ...FEMALE_CATEGORIES])];
};

export default function StylingPage() {
  const { user } = useAuth();
  const profile = user?.profile || {};

  const [mode, setMode] = useState("whole"); // "whole" | "build_around"
  const [step, setStep] = useState(0);

  // Default preferences
  const [prefs, setPrefs] = useState({
    gender: profile.gender || "",
    occasion: profile.occasion || "",
    age: profile.age || "",
    budget: profile.budget || 2000,
  });

  // Mode 1: Skin Tone Analysis Data
  const [skinData, setSkinData] = useState(
    profile.skin_tone ? { skin_tone: profile.skin_tone, skin_hex: profile.skin_hex, color_palette: null } : null
  );

  const [uploadedUserImage, setUploadedUserImage] = useState(null);

  const [skinToneModalOpen, setSkinToneModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("manual"); // "manual" | "detect"
  const [selectedSkinTone, setSelectedSkinTone] = useState(profile.skin_tone || "Medium");
  const [selectedSkinHex, setSelectedSkinHex] = useState(profile.skin_hex || "#DEB088");
  const [detectedSkinData, setDetectedSkinData] = useState(null);

  // Mode 2: Build Around My Item Data
  const [baseItemName, setBaseItemName] = useState("");
  const [baseItemImage, setBaseItemImage] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Results & Loading
  const [results, setResults] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [paletteModalOpen, setPaletteModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Dynamic Steps
  const STEPS_WHOLE = ["Photo & Skin Tone", "Your Preferences", "Outfit Recommendations"];
  const STEPS_BUILD = ["Your Base Item", "Categories & Budget", "Outfit Recommendations"];
  const steps = mode === "whole" ? STEPS_WHOLE : STEPS_BUILD;

  const handlePhotoDetected = (data) => {
    setSkinData(data);
  };

  const handlePhotoDetectedInModal = async (data) => {
    setSkinData(data);
    setUploadModalOpen(false);
    setGenerating(true);
    try {
      const res = await outfitAPI.generate({
        skin_tone: data.skin_tone,
        skin_hex: data.skin_hex,
        ...prefs,
        age: parseInt(prefs.age) || 25,
      });
      setResults(res.data);
      toast.success("Outfits regenerated for new skin tone!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not generate outfits");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async (skinToneOverride) => {
    // Validations
    if (mode === "build_around") {
      if (!baseItemName && !baseItemImage) {
        toast.error("Please provide an item description or upload a photo");
        return;
      }
      if (!prefs.gender) {
        toast.error("Please select a gender");
        return;
      }
      if (selectedCategories.length === 0) {
        toast.error("Please select at least one category to pair");
        return;
      }
      if (!prefs.occasion || !prefs.age) {
        toast.error("Please select occasion and age");
        return;
      }

      // Present Choose Skin Tone modal before generating recommendations
      if (!skinToneOverride && !skinToneModalOpen) {
        // Pre-fill selection if we already have it in skinData
        if (skinData?.skin_tone) {
          setSelectedSkinTone(skinData.skin_tone);
          setSelectedSkinHex(skinData.skin_hex || "#DEB088");
        }
        setSkinToneModalOpen(true);
        return;
      }
    } else {
      if (!prefs.gender || !prefs.occasion || !prefs.age) {
        toast.error("Please fill in all preferences");
        return;
      }
    }

    setGenerating(true);
    setSkinToneModalOpen(false);
    try {
      const activeSkinData = (skinToneOverride && skinToneOverride.skin_tone) ? skinToneOverride : skinData;
      const payload = {
        mode,
        gender: prefs.gender,
        occasion: prefs.occasion,
        age: parseInt(prefs.age) || 25,
        budget: prefs.budget,
        skin_tone: activeSkinData?.skin_tone || "Medium",
        skin_hex: activeSkinData?.skin_hex || "#DEB088",
      };

      if (mode === "build_around") {
        payload.selected_categories = selectedCategories;
        payload.base_item_name = baseItemName;
        payload.base_item_image = baseItemImage;
      }

      const res = await outfitAPI.generate(payload);
      setResults(res.data);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not generate recommendations");
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setResults(null);
    setSkinData(mode === "whole" && profile.skin_tone ? { skin_tone: profile.skin_tone, skin_hex: profile.skin_hex } : null);
    setBaseItemImage(null);
    setUploadedUserImage(null);
    setBaseItemName("");
    setSelectedCategories([]);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setStep(0);
    setResults(null);
    setSkinData(newMode === "whole" && profile.skin_tone ? { skin_tone: profile.skin_tone, skin_hex: profile.skin_hex } : null);
    setBaseItemImage(null);
    setUploadedUserImage(null);
    setBaseItemName("");
    setSelectedCategories([]);
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MobileNav />
      <main className="main-content">
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h2>Get Styled</h2>
          <p>
            {mode === "whole"
              ? "Upload your photo and let AI craft the perfect complete outfit for you."
              : "Tell AI about an item you own to build a complete matching look around it."}
          </p>
        </div>

        {/* Mode Selector Tab */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
          <button
            className={`btn ${mode === "whole" ? "btn-gold" : "btn-outline"}`}
            onClick={() => changeMode("whole")}
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            ✨ Get Whole Outfit Styled
          </button>
          <button
            className={`btn ${mode === "build_around" ? "btn-gold" : "btn-outline"}`}
            onClick={() => changeMode("build_around")}
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            🧩 Build Around My Item
          </button>
        </div>

        {/* Step indicator */}
        <div className="step-indicator" style={{ marginBottom: 32 }}>
          {steps.map((s, i) => (
            <div
              key={s}
              className={`step-dot ${i === step ? "active" : i < step ? "done" : ""}`}
              title={s}
            />
          ))}
          <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginLeft: 8 }}>
            Step {step + 1} of {steps.length}: {steps[step]}
          </span>
        </div>

        {/* Step 0: Photo & Details */}
        {step === 0 && (
          <div className={`fade-in ${mode === "whole" ? "dashboard-split-layout" : ""}`}>
            {mode === "whole" ? (
              // Mode 1 Step 0
              <>
                <div style={{ flex: 1 }}>
                  <div className="card" style={{ marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 6 }}>Upload Your Photo</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                      We'll analyze your skin tone to find colors and styles that complement you.
                    </p>
                    <PhotoUploader onDetected={handlePhotoDetected} onUpload={(base64) => setUploadedUserImage(base64)} />
                  </div>

                  {skinData?.skin_tone ? (
                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-primary" onClick={() => setStep(1)}>
                        Continue to Preferences <ChevronRight size={16} />
                      </button>
                    </div>
                  ) : profile.skin_tone ? (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>
                        Or use your previously detected skin tone:
                        <span className="badge badge-gold" style={{ marginLeft: 8 }}>{profile.skin_tone}</span>
                      </p>
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setSkinData({ skin_tone: profile.skin_tone, skin_hex: profile.skin_hex });
                          setStep(1);
                        }}
                      >
                        Use saved skin tone <ChevronRight size={16} />
                      </button>
                    </div>
                  ) : null}
                </div>

                <aside className="palette-aside">
                  {skinData?.color_palette ? (
                    <ColorPalette
                      palette={skinData.color_palette}
                      skinTone={skinData.skin_tone}
                      skinHex={skinData.skin_hex}
                    />
                  ) : (
                    <div className="card" style={{ padding: 20 }}>
                      <h3 style={{ marginTop: 0 }}>Color Suggestions</h3>
                      <p style={{ color: "var(--text-muted)", marginBottom: 12 }}>
                        Your AI color palette will appear here after you upload a photo.
                      </p>
                      <div className="palette-row" style={{ gap: 10 }}>
                        <div className="color-swatch" style={{ background: "#FDEFF2", width: 44, height: 44 }} />
                        <div className="color-swatch" style={{ background: "#FFB6C1", width: 44, height: 44 }} />
                        <div className="color-swatch" style={{ background: "#2AA7A0", width: 44, height: 44 }} />
                        <div className="color-swatch" style={{ background: "#F7EDEB", width: 44, height: 44 }} />
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => document.querySelector(".upload-area")?.click()}>
                          Upload a Photo
                        </button>
                      </div>
                    </div>
                  )}
                </aside>
              </>
            ) : (
              // Mode 2 Step 0 (Build Around is centered, single column)
              <div style={{ maxWidth: 680, margin: "0 auto", width: "100%" }}>
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 6 }}>Upload or Describe Your Clothing Item</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                    Upload an image of your item (optional) or describe it manually below.
                  </p>
                  
                  <PhotoUploader
                    skipAnalysis={true}
                    onUpload={(base64) => setBaseItemImage(base64)}
                    onDetected={() => {}}
                  />

                  <div className="form-group" style={{ marginTop: 24 }}>
                    <label className="form-label">Item Description / Name</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="E.g. Navy Blue Blazer, Red Floral Dress, Black Leather Jacket"
                      value={baseItemName}
                      onChange={(e) => setBaseItemName(e.target.value)}
                      required={!baseItemImage}
                    />
                    <small style={{ color: "var(--text-muted)", display: "block", marginTop: 4 }}>
                      Specify the color, style, or fabric if skipping photo upload.
                    </small>
                  </div>

                  <div className="form-group" style={{ marginTop: 20 }}>
                    <label className="form-label">Gender (To display correct matching categories)</label>
                    <div className="chip-group">
                      {GENDERS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          className={`chip ${prefs.gender === g ? "selected" : ""}`}
                          onClick={() => setPrefs({ ...prefs, gender: g })}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (!baseItemImage && !baseItemName) {
                        toast.error("Please upload an image or type the item name");
                        return;
                      }
                      if (!prefs.gender) {
                        toast.error("Please select a gender");
                        return;
                      }
                      setStep(1);
                    }}
                  >
                    Continue to Pairings <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Preferences / Categories */}
        {step === 1 && (
          <div className="fade-in dashboard-split-layout">
            <div style={{ flex: 1, width: "100%" }}>
              {mode === "whole" ? (
                // Mode 1 Step 1: Whole Outfit Preferences
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 20 }}>Your Style Preferences</h3>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <div className="chip-group">
                      {GENDERS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          className={`chip ${prefs.gender === g ? "selected" : ""}`}
                          onClick={() => setPrefs({ ...prefs, gender: g })}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Occasion</label>
                    <div className="chip-group">
                      {OCCASIONS.map((o) => (
                        <button
                          key={o}
                          type="button"
                          className={`chip ${prefs.occasion === o ? "selected" : ""}`}
                          onClick={() => setPrefs({ ...prefs, occasion: o })}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Enter your age (e.g. 25)"
                      value={prefs.age}
                      onChange={(e) => setPrefs({ ...prefs, age: e.target.value })}
                      min={1}
                      max={120}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Budget (₹)</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {[500, 1000, 2000, 5000, 10000, 20000].map((b) => (
                        <button
                          key={b}
                          type="button"
                          className={`chip ${prefs.budget === b ? "selected" : ""}`}
                          onClick={() => setPrefs({ ...prefs, budget: b })}
                        >
                          ₹{b.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Or enter custom amount"
                      value={prefs.budget}
                      onChange={(e) => setPrefs({ ...prefs, budget: parseInt(e.target.value) || 0 })}
                      min={100}
                      max={500000}
                    />
                  </div>
                </div>
              ) : (
                // Mode 2 Step 1: Build Around Preferences & Categories
                <div className="card" style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 20 }}>Style & Pairing Preferences</h3>

                  {/* Categories */}
                  <div className="form-group">
                    <label className="form-label">Select Categories to Recommend</label>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>
                      Budget will automatically distribute across the categories you select.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                      {getCategoriesForGender(prefs.gender).map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <div
                            key={cat}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                              } else {
                                setSelectedCategories([...selectedCategories, cat]);
                              }
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 14px",
                              background: "var(--bg-secondary)",
                              border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)",
                              borderRadius: "var(--radius)",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              boxShadow: isSelected ? "var(--accent-glow) 0px 0px 8px" : "none",
                            }}
                          >
                            <div
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                border: isSelected ? "2px solid var(--accent)" : "2px solid var(--text-muted)",
                                background: isSelected ? "var(--accent)" : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.15s ease",
                                flexShrink: 0,
                              }}
                            >
                              {isSelected && (
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="var(--bg-primary)"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                              }}
                            >
                              {cat}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Occasion */}
                  <div className="form-group" style={{ marginTop: 24 }}>
                    <label className="form-label">Occasion</label>
                    <div className="chip-group">
                      {OCCASIONS.map((o) => (
                        <button
                          key={o}
                          type="button"
                          className={`chip ${prefs.occasion === o ? "selected" : ""}`}
                          onClick={() => setPrefs({ ...prefs, occasion: o })}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age */}
                  <div className="form-group" style={{ marginTop: 24 }}>
                    <label className="form-label">Age</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Enter your age (e.g. 25)"
                      value={prefs.age}
                      onChange={(e) => setPrefs({ ...prefs, age: e.target.value })}
                      min={1}
                      max={120}
                      required
                    />
                  </div>

                  {/* Budget */}
                  <div className="form-group" style={{ marginTop: 24 }}>
                    <label className="form-label">Total Outfit Budget (₹)</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {[1000, 2000, 5000, 10000, 20000].map((b) => (
                        <button
                          key={b}
                          type="button"
                          className={`chip ${prefs.budget === b ? "selected" : ""}`}
                          onClick={() => setPrefs({ ...prefs, budget: b })}
                        >
                          ₹{b.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Or enter custom amount"
                      value={prefs.budget}
                      onChange={(e) => setPrefs({ ...prefs, budget: parseInt(e.target.value) || 0 })}
                      min={100}
                      max={500000}
                    />
                  </div>
                </div>
              )}

              {/* Back / Generate Action Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-outline" onClick={() => setStep(0)}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  className="btn btn-gold btn-lg"
                  onClick={() => handleGenerate()}
                  disabled={
                    generating || 
                    (mode === "whole" && (!prefs.gender || !prefs.occasion || !prefs.age)) ||
                    (mode === "build_around" && (!prefs.occasion || !prefs.age || selectedCategories.length === 0))
                  }
                >
                  <Sparkles size={18} />
                  {generating ? "Generating recommendations..." : "Generate Recommendations"}
                </button>
              </div>
            </div>

            <aside className="palette-aside" style={{ height: "100%" }}>
              <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)", height: "100%", display: "flex", flexDirection: "column" }}>
                <img 
                  src="/styling_mood_board.png" 
                  alt="Style Inspiration" 
                  style={{ width: "100%", height: 360, objectFit: "cover", flex: 1 }} 
                />
                <div style={{ padding: 24, background: "var(--bg-card)" }}>
                  <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: "1.1rem" }}>Style Inspiration</h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16, margin: 0 }}>
                    "Fashion is part of the daily air and it changes all the time, with all the events. You can even see the approaching of a revolution in clothes."
                  </p>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    — Diana Vreeland
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Step 2: Recommendations Results */}
        {step === 2 && results && (
          <div className="fade-in styling-results-container">
            {/* Top row of buttons (Whole Outfit styled mode only) */}
            {mode === "whole" && (
              <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => setPaletteModalOpen(true)}>
                  View Color Palette
                </button>
                <button className="btn btn-outline" onClick={() => setUploadModalOpen(true)}>
                  Upload Image
                </button>
              </div>
            )}

            {/* Overall Advice Banner */}
            {results.overall_advice && (
              <div
                style={{
                  padding: "16px 20px",
                  background: "rgba(36, 94, 173, 0.06)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: 28,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span style={{ color: "var(--accent)", fontWeight: 600, marginRight: 8 }}>✦ Style Advice:</span>
                {results.overall_advice}
              </div>
            )}

            {/* Recommended Outfits Grid (always full width) */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: "1.2rem", textTransform: "lowercase", fontWeight: 600 }}>
                  {mode === "whole" ? "recommended outfits for you" : "recommended matching looks"}
                </h3>
                <button className="btn btn-outline btn-sm" onClick={handleReset}>
                  <RefreshCw size={14} style={{ marginRight: 6 }} /> New Session
                </button>
              </div>

              {generating ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 }}>
                  <div className="spinner" />
                  <p style={{ color: "var(--text-secondary)" }}>Updating recommendations...</p>
                </div>
              ) : (
                <div className="grid-outfits">
                  {results.outfits?.map((outfit, index) => (
                    <OutfitCard key={outfit.id || outfit.name || index} outfit={outfit} mode={mode} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Palette Modal */}
        {paletteModalOpen && (
          <div className="modal-overlay" onClick={() => setPaletteModalOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setPaletteModalOpen(false)}>
                <X size={20} />
              </button>
              <div style={{ marginTop: 12 }}>
                <ColorPalette
                  palette={results.color_palette}
                  skinTone={results.skin_tone}
                  skinHex={skinData?.skin_hex}
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Image Modal */}
        {uploadModalOpen && (
          <div className="modal-overlay" onClick={() => setUploadModalOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setUploadModalOpen(false)}>
                <X size={20} />
              </button>
              <div style={{ padding: "12px 0 0" }}>
                <h3 style={{ marginBottom: 6 }}>Upload Your Photo</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
                  We'll analyze your skin tone to find colors and styles that complement you.
                </p>
                <PhotoUploader onDetected={handlePhotoDetectedInModal} onUpload={(base64) => setUploadedUserImage(base64)} />
              </div>
            </div>
          </div>
        )}

        {/* Skin Tone Selection Modal */}
        {skinToneModalOpen && (
          <div className="modal-overlay" onClick={() => setSkinToneModalOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
              <button className="modal-close-btn" onClick={() => setSkinToneModalOpen(false)}>
                <X size={20} />
              </button>
              
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: "1.3rem", marginBottom: 6 }}>Choose Skin Tone</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  To suggest the best outfit colors, we need to know your skin tone.
                </p>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
                <button
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    background: "none",
                    color: modalTab === "manual" ? "var(--accent)" : "var(--text-secondary)",
                    borderBottom: modalTab === "manual" ? "2px solid var(--accent)" : "none",
                    borderRadius: 0,
                    fontWeight: 600,
                    padding: "10px 0"
                  }}
                  onClick={() => setModalTab("manual")}
                >
                  Select Manually
                </button>
                <button
                  className="btn btn-sm"
                  style={{
                    flex: 1,
                    background: "none",
                    color: modalTab === "detect" ? "var(--accent)" : "var(--text-secondary)",
                    borderBottom: modalTab === "detect" ? "2px solid var(--accent)" : "none",
                    borderRadius: 0,
                    fontWeight: 600,
                    padding: "10px 0"
                  }}
                  onClick={() => setModalTab("detect")}
                >
                  Detect from Image
                </button>
              </div>

              {/* Tab Content */}
              {modalTab === "manual" ? (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                    {SKIN_TONES.map((tone) => {
                      const isSelected = selectedSkinTone === tone.name;
                      return (
                        <div
                          key={tone.name}
                          onClick={() => {
                            setSelectedSkinTone(tone.name);
                            setSelectedSkinHex(tone.hex);
                          }}
                          style={{
                            border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "12px 8px",
                            textAlign: "center",
                            cursor: "pointer",
                            background: isSelected ? "var(--accent-glow)" : "var(--bg-secondary)",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? "var(--accent-glow) 0px 0px 8px" : "none",
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: "50%",
                              background: tone.hex,
                              margin: "0 auto 8px",
                              border: "1px solid rgba(0,0,0,0.1)",
                            }}
                          />
                          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                            {tone.name}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div style={{ background: "var(--bg-secondary)", padding: 12, borderRadius: "var(--radius)", marginBottom: 24, border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center" }}>
                      {SKIN_TONES.find(t => t.name === selectedSkinTone)?.desc}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSkinToneModalOpen(false)}>
                      Cancel
                    </button>
                    <button
                      className="btn btn-gold"
                      style={{ flex: 1 }}
                      onClick={() => {
                        const newSkin = { skin_tone: selectedSkinTone, skin_hex: selectedSkinHex };
                        setSkinData(newSkin);
                        handleGenerate(newSkin);
                      }}
                    >
                      Confirm & Generate
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <PhotoUploader
                    onDetected={(data) => {
                      setSkinData(data);
                      setSelectedSkinTone(data.skin_tone);
                      setSelectedSkinHex(data.skin_hex);
                      setModalTab("manual");
                      toast.success(`Detected skin tone: ${data.skin_tone}! Confirm details and generate.`);
                    }}
                    onUpload={(base64) => setUploadedUserImage(base64)}
                  />
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setSkinToneModalOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}