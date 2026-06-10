import React, { useState } from "react";
import { Info } from "lucide-react";

function hexToRgba(hex, alpha = 0.08) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ColorPalette({ palette, skinTone, skinHex }) {
  const [copied, setCopied] = useState(null);

  const copy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!palette) return null;

  const base = (palette.primary && palette.primary[0]) || palette.secondary?.[0] || '#f3efe9';
  const bg = hexToRgba(base, 0.06);

  return (
    <div className="card" style={{ marginBottom: 24, background: bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        {skinHex && (
          <div
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: skinHex,
              border: "3px solid var(--border)",
              flexShrink: 0
            }}
          />
        )}
        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: 2 }}>
            Your Color Palette{skinTone ? ` — ${skinTone} Tone` : ""}
          </h3>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            {palette.description}
          </p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Primary Colors
        </p>
        <div className="palette-row">
          {palette.primary?.map((hex) => (
            <div key={hex} style={{ textAlign: "center" }}>
              <div
                className="color-swatch"
                style={{ background: hex, width: 40, height: 40 }}
                title={`Click to copy ${hex}`}
                onClick={() => copy(hex)}
              />
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", marginTop: 3 }}>
                {copied === hex ? "Copied!" : hex}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Secondary / Neutrals
        </p>
        <div className="palette-row">
          {palette.secondary?.map((hex) => (
            <div key={hex} style={{ textAlign: "center" }}>
              <div
                className="color-swatch"
                style={{ background: hex, width: 36, height: 36 }}
                onClick={() => copy(hex)}
              />
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", marginTop: 3 }}>
                {copied === hex ? "Copied!" : hex}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Accent Colors
        </p>
        <div className="palette-row">
          {palette.accent?.map((hex) => (
            <div key={hex} style={{ textAlign: "center" }}>
              <div
                className="color-swatch"
                style={{ background: hex, width: 32, height: 32 }}
                onClick={() => copy(hex)}
              />
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", marginTop: 3 }}>
                {copied === hex ? "Copied!" : hex}
              </span>
            </div>
          ))}
        </div>
      </div>

      {palette.avoid && (
        <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: "var(--radius)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Info size={14} style={{ color: "var(--danger)" }} />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--danger)" }}>Colors to avoid</span>
          </div>
          <div className="palette-row">
            {palette.avoid.map((hex) => (
              <div
                key={hex}
                className="color-swatch"
                style={{ background: hex, width: 28, height: 28, opacity: 0.7 }}
                title={hex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}