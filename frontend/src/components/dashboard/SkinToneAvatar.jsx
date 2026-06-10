import React from "react";

export default function SkinToneAvatar({ skinTone, size = 48 }) {
  // Map skin tone names to hex colors
  const toneColors = {
    "Fair": "#F5C396",
    "Light": "#E8B282",
    "Medium": "#C68642",
    "Olive": "#AE703B",
    "Deep": "#8D5524",
    "Dark": "#623B1C"
  };
  
  // Default fallback color if tone not recognized or not yet detected
  const skinColor = toneColors[skinTone] || "#E0AC69";

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      style={{ borderRadius: "50%", background: "var(--bg-secondary)", border: "2px solid var(--border)", flexShrink: 0 }}
      aria-label={`Avatar for skin tone ${skinTone || "default"}`}
    >
      {/* Background fill */}
      <circle cx="50" cy="50" r="48" fill="var(--bg-secondary)" />
      {/* Shirt */}
      <path d="M 20 95 Q 50 78 80 95 Z" fill="var(--accent)" />
      {/* Neck */}
      <rect x="44" y="52" width="12" height="15" fill={skinColor} />
      {/* Neck collar notch */}
      <path d="M 44 52 L 50 60 L 56 52 Z" fill="rgba(0, 0, 0, 0.1)" />
      {/* Face */}
      <circle cx="50" cy="40" r="17" fill={skinColor} />
      {/* Hair shadow */}
      <path d="M 31 36 Q 50 16 69 36 Q 63 24 50 24 Q 37 24 31 36 Z" fill="#2D3748" opacity="0.4" />
      {/* Hair (Chic modern hairstyle) */}
      <path d="M 31 36 Q 50 16 69 36 Q 71 50 67 52 C 67 40 64 36 50 36 C 36 36 33 40 33 52 C 29 50 31 36 31 36 Z" fill="#1A202C" />
      {/* Glasses (optional accessory look) */}
      <circle cx="43" cy="40" r="4" fill="none" stroke="#2D3748" strokeWidth="1.5" opacity="0.3" />
      <circle cx="57" cy="40" r="4" fill="none" stroke="#2D3748" strokeWidth="1.5" opacity="0.3" />
      <line x1="47" y1="40" x2="53" y2="40" stroke="#2D3748" strokeWidth="1.5" opacity="0.3" />
    </svg>
  );
}
