import React, { useState } from "react";
import { Bookmark, BookmarkCheck, ShoppingBag, ChevronDown, ChevronUp, Scissors, Footprints, ShirtIcon, Star } from "lucide-react";
import toast from "react-hot-toast";
import { outfitAPI } from "../../utils/api";

const TIER_COLORS = {
  "Budget-Friendly": "badge-green",
  "Balanced": "badge-purple",
  "Premium": "badge-gold",
};

const MyntraLogo = () => (
  <svg viewBox="0 0 100 80" style={{ height: "18px", width: "auto" }}>
    <path d="M 15 65 L 35 15 L 50 45 L 65 15 L 85 65 L 70 65 L 57 32 L 50 48 L 43 32 L 30 65 Z" fill="#E11A7A" />
    <path d="M 50 45 L 65 15 L 85 65 L 70 65 L 57 32 Z" fill="#F75231" opacity="0.9" />
    <path d="M 35 15 L 50 45 L 43 32 Z" fill="#F78C20" opacity="0.95" />
  </svg>
);

const AjioLogo = () => (
  <svg viewBox="0 0 80 25" style={{ height: "14px", width: "auto" }}>
    <text x="40" y="20" fontFamily="'Inter', -apple-system, sans-serif" fontWeight="900" fontSize="22" fill="currentColor" textAnchor="middle">ajio</text>
  </svg>
);

const AmazonLogo = () => (
  <svg viewBox="0 0 100 30" style={{ height: "14px", width: "auto", overflow: "visible" }}>
    <text x="50" y="17" fontFamily="'Inter', system-ui, sans-serif" fontWeight="800" fontSize="16" fill="currentColor" textAnchor="middle">amazon</text>
    <path d="M 15 22 Q 50 31 85 22" stroke="#FF9900" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M 81 20 L 85 23 L 83 18 Z" fill="#FF9900" />
  </svg>
);

const FlipkartLogo = () => (
  <svg viewBox="0 0 110 32" style={{ height: "15px", width: "auto" }}>
    <rect x="2" y="5" width="22" height="22" rx="4" fill="#2874F0" />
    <path d="M 8 5 V 2 C 8 1, 18 1, 18 2 V 5" stroke="#2874F0" strokeWidth="1.5" fill="none" />
    <text x="13" y="21" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="#FFE500" textAnchor="middle">f</text>
    <text x="30" y="21" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontWeight="bold" fontSize="15" fill="#2874F0">Flipkart</text>
  </svg>
);

const BRAND_LOGOS = {
  myntra: <MyntraLogo />,
  ajio: <AjioLogo />,
  amazon: <AmazonLogo />,
  flipkart: <FlipkartLogo />
};

function ShopLinks({ links }) {
  if (!links) return null;
  return (
    <div className="brand-links-row">
      {['myntra', 'ajio', 'amazon', 'flipkart'].map((brand) => {
        const url = links[brand];
        if (!url) return null;
        return (
          <a
            key={brand}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-link-btn"
            title={`Shop on ${brand.charAt(0).toUpperCase() + brand.slice(1)}`}
          >
            {BRAND_LOGOS[brand] || brand}
          </a>
        );
      })}
    </div>
  );
}

export default function OutfitCard({ outfit, showSave = true, mode }) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await outfitAPI.save(outfit);
      setSaved(true);
      toast.success("Outfit saved!");
    } catch {
      toast.error("Could not save outfit");
    } finally {
      setSaving(false);
    }
  };

  const tierClass = TIER_COLORS[outfit.budget_tier] || "badge-purple";
  const isBuildAround = mode === "build_around";

  return (
    <div className="outfit-card fade-in">
      <div className="outfit-header">
        <div>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 8 }}>{outfit.name}</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span className={`badge ${tierClass}`}>{outfit.budget_tier}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Estimated Cost: ₹{outfit.estimated_cost?.toLocaleString()}
            </span>
          </div>
        </div>
        {showSave && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleSave}
            disabled={saved || saving}
            title={saved ? "Saved" : "Save outfit"}
          >
            {saved ? <BookmarkCheck size={18} style={{ color: "var(--success)" }} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      <div className="outfit-body">
        {isBuildAround ? (
          <div>
            {/* Base Item Context */}
            {outfit.base_item && (
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 16, background: "rgba(188,142,66,0.04)", padding: "8px 12px", borderRadius: "8px", borderLeft: "2px solid var(--accent)", border: "1px solid var(--border)" }}>
                Built around: <strong>{outfit.base_item.item}</strong> {outfit.base_item.color && `(${outfit.base_item.color})`}
              </div>
            )}

            {/* Recommended Components Feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {outfit.top && (
                <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>{outfit.top.item}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>₹{outfit.top.estimated_cost}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    Color: {outfit.top.color} {outfit.top.material && `· Fabric: ${outfit.top.material}`}
                  </div>
                  <ShopLinks links={outfit.top.shopping_links || outfit.shopping_links?.Top} />
                </div>
              )}

              {outfit.bottom && (
                <div style={{ paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>{outfit.bottom.item}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>₹{outfit.bottom.estimated_cost}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    Color: {outfit.bottom.color} {outfit.bottom.material && `· Fabric: ${outfit.bottom.material}`}
                  </div>
                  <ShopLinks links={outfit.bottom.shopping_links || outfit.shopping_links?.Bottom} />
                </div>
              )}

              {outfit.footwear && (
                <div style={{ paddingBottom: 14, borderBottom: outfit.accessories?.length > 0 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>{outfit.footwear.item}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>₹{outfit.footwear.estimated_cost}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    Color: {outfit.footwear.color}
                  </div>
                  <ShopLinks links={outfit.footwear.shopping_links || outfit.shopping_links?.Footwear} />
                </div>
              )}

              {outfit.accessories?.map((acc, idx) => (
                <div key={idx} style={{ paddingBottom: idx === outfit.accessories.length - 1 ? 0 : 14, borderBottom: idx === outfit.accessories.length - 1 ? "none" : "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>{acc.item}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--accent)", fontWeight: 600 }}>₹{acc.estimated_cost}</span>
                  </div>
                  {acc.color && (
                    <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                      Color: {acc.color}
                    </div>
                  )}
                  <ShopLinks links={acc.shopping_links || outfit.shopping_links?.Accessory} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Why it works */}
            <div style={{
              padding: "12px 14px",
              background: "rgba(188,142,66,0.08)",
              borderRadius: "var(--radius)",
              marginBottom: 16,
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              borderLeft: "3px solid var(--accent)"
            }}>
              <Star size={12} style={{ display: "inline", marginRight: 6, color: "var(--gold)" }} />
              {outfit.why_it_works}
            </div>

            {/* Base Item */}
            {outfit.base_item && (
              <div className="outfit-section" style={{ border: "1px dashed var(--accent)", padding: "10px 12px", borderRadius: "var(--radius)", background: "rgba(188,142,66,0.03)", marginBottom: 16 }}>
                <div className="section-icon" style={{ color: "var(--accent)" }}><ShirtIcon size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2, color: "var(--accent)" }}>Your Base Item (Owned)</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {outfit.base_item.item} — <span className="color-name">{outfit.base_item.color}</span>
                    {outfit.base_item.pattern && <span style={{ color: "var(--text-muted)" }}> · {outfit.base_item.pattern}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Top */}
            {outfit.top && (
              <div className="outfit-section">
                <div className="section-icon"><ShirtIcon size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>Top</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {outfit.top.item} — <span className="color-name">{outfit.top.color}</span>
                    {outfit.top.material && <span style={{ color: "var(--text-muted)" }}> · {outfit.top.material}</span>}
                  </div>
                  <ShopLinks links={outfit.top.shopping_links || outfit.shopping_links?.Top} />
                </div>
              </div>
            )}

            {/* Bottom */}
            {outfit.bottom && (
              <div className="outfit-section">
                <div className="section-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 8l9 14 9-14-3-6H6z"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>Bottom</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {outfit.bottom.item} — <span className="color-name">{outfit.bottom.color}</span>
                    {outfit.bottom.material && <span style={{ color: "var(--text-muted)" }}> · {outfit.bottom.material}</span>}
                  </div>
                  <ShopLinks links={outfit.bottom.shopping_links || outfit.shopping_links?.Bottom} />
                </div>
              </div>
            )}

            {/* Footwear */}
            {outfit.footwear && (
              <div className="outfit-section">
                <div className="section-icon"><Footprints size={16} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>Footwear</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {outfit.footwear.item} — <span className="color-name">{outfit.footwear.color}</span>
                  </div>
                  <ShopLinks links={outfit.footwear.shopping_links || outfit.shopping_links?.Footwear} />
                </div>
              </div>
            )}

            {/* Expand toggle */}
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setExpanded(!expanded)}
              style={{ marginTop: 4, gap: 6, fontSize: "0.8rem" }}
            >
              {expanded ? <><ChevronUp size={14} /> Less details</> : <><ChevronDown size={14} /> More details</>}
            </button>

            {expanded && (
              <div className="fade-in" style={{ marginTop: 16 }}>
                {/* Compact pricing summary */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "4px 12px",
                  background: "var(--bg-secondary)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius)",
                  fontSize: "0.78rem",
                  border: "1px solid var(--border)",
                  marginBottom: 16
                }}>
                  {outfit.top?.estimated_cost !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Top:</span>
                      <span style={{ fontWeight: 600 }}>₹{outfit.top.estimated_cost}</span>
                    </div>
                  )}
                  {outfit.bottom?.estimated_cost !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Bottom:</span>
                      <span style={{ fontWeight: 600 }}>₹{outfit.bottom.estimated_cost}</span>
                    </div>
                  )}
                  {outfit.footwear?.estimated_cost !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Footwear:</span>
                      <span style={{ fontWeight: 600 }}>₹{outfit.footwear.estimated_cost}</span>
                    </div>
                  )}
                  {outfit.accessories?.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Accessories:</span>
                      <span style={{ fontWeight: 600 }}>
                        ₹{outfit.accessories.reduce((sum, acc) => sum + (acc.estimated_cost || 0), 0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Accessories */}
                {outfit.accessories?.length > 0 && (
                  <div className="outfit-section">
                    <div className="section-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 6 }}>Accessories</div>
                      {outfit.accessories.map((acc, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{acc.item}</div>
                          <ShopLinks links={acc.shopping_links || outfit.shopping_links?.Accessory} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hairstyle */}
                {outfit.hairstyle && (
                  <div className="outfit-section">
                    <div className="section-icon"><Scissors size={16} /></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 2 }}>Hairstyle</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{outfit.hairstyle}</div>
                    </div>
                  </div>
                )}

                {/* Color story */}
                {outfit.color_story && (
                  <div style={{
                    padding: "10px 14px",
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius)",
                    marginTop: 8
                  }}>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 4 }}>Color Story</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{outfit.color_story}</div>
                  </div>
                )}

                {/* Styling tips */}
                {outfit.styling_tips?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: 8 }}>Styling Tips</div>
                    {outfit.styling_tips.map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        <span style={{ color: "var(--accent)", fontWeight: 700 }}>·</span>
                        {tip}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}