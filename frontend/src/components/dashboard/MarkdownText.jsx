import React from "react";

export default function MarkdownText({ text }) {
  if (!text) return null;

  // Split by lines to parse structure
  const lines = text.split("\n");
  const elements = [];
  let currentList = [];
  let listType = null; // "ul" | "ol"

  const parseInlineStyles = (line) => {
    // 1. Parse bold: **text** (strip asterisks)
    let parts = [];
    let currentIndex = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > currentIndex) {
        parts.push(line.substring(currentIndex, match.index));
      }
      parts.push(match[1]); // Plain text, no <strong> tag
      currentIndex = boldRegex.lastIndex;
    }
    if (currentIndex < line.length) {
      parts.push(line.substring(currentIndex));
    }

    if (parts.length === 0) {
      parts = [line];
    }

    // 2. Parse italic: *text* (strip asterisks)
    const finalParts = [];
    parts.forEach((part) => {
      if (typeof part !== "string") {
        finalParts.push(part);
        return;
      }

      let subIndex = 0;
      const italicRegex = /\*(.*?)\*/g;
      let subMatch;

      while ((subMatch = italicRegex.exec(part)) !== null) {
        if (subMatch.index > subIndex) {
          finalParts.push(part.substring(subIndex, subMatch.index));
        }
        finalParts.push(subMatch[1]); // Plain text, no <em> tag
        subIndex = italicRegex.lastIndex;
      }

      if (subIndex < part.length) {
        finalParts.push(part.substring(subIndex));
      }
    });

    return finalParts.length > 0 ? finalParts : line;
  };

  const flushList = (key) => {
    if (currentList.length === 0) return;
    if (listType === "ul") {
      elements.push(
        <ul key={key} style={{ margin: "8px 0 12px 0", paddingLeft: "20px", listStyleType: "disc" }}>
          {currentList}
        </ul>
      );
    } else if (listType === "ol") {
      elements.push(
        <ol key={key} style={{ margin: "8px 0 12px 0", paddingLeft: "20px", listStyleType: "decimal" }}>
          {currentList}
        </ol>
      );
    }
    currentList = [];
    listType = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith("### ")) {
      flushList(`list-${index}`);
      elements.push(
        <h4 key={index} style={{ margin: "14px 0 8px", fontSize: "1.02rem", fontWeight: 600, fontFamily: "inherit", color: "var(--accent)" }}>
          {parseInlineStyles(trimmed.substring(4))}
        </h4>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(`list-${index}`);
      elements.push(
        <h3 key={index} style={{ margin: "18px 0 10px", fontSize: "1.15rem", fontWeight: 700, fontFamily: "inherit", color: "var(--accent)" }}>
          {parseInlineStyles(trimmed.substring(3))}
        </h3>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList(`list-${index}`);
      elements.push(
        <h2 key={index} style={{ margin: "20px 0 12px", fontSize: "1.3rem", fontWeight: 700, fontFamily: "inherit", color: "var(--accent)" }}>
          {parseInlineStyles(trimmed.substring(2))}
        </h2>
      );
    }
    // Bullet List Items
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (listType === "ol") {
        flushList(`list-${index}-switch`);
      }
      listType = "ul";
      currentList.push(
        <li key={index} style={{ marginBottom: 6, fontSize: "0.88rem", lineHeight: "1.5" }}>
          {parseInlineStyles(trimmed.substring(2))}
        </li>
      );
    }
    // Numbered List Items
    else if (/^\d+\.\s/.test(trimmed)) {
      if (listType === "ul") {
        flushList(`list-${index}-switch`);
      }
      listType = "ol";
      const spaceIdx = trimmed.indexOf(" ");
      currentList.push(
        <li key={index} style={{ marginBottom: 6, fontSize: "0.88rem", lineHeight: "1.5" }}>
          {parseInlineStyles(trimmed.substring(spaceIdx + 1))}
        </li>
      );
    }
    // Blank lines
    else if (trimmed === "") {
      flushList(`list-${index}`);
      elements.push(<div key={index} style={{ height: "8px" }} />);
    }
    // Normal paragraphs
    else {
      flushList(`list-${index}`);
      elements.push(
        <p key={index} style={{ margin: "0 0 10px", fontSize: "0.88rem", lineHeight: "1.55" }}>
          {parseInlineStyles(line)}
        </p>
      );
    }
  });

  // Flush remaining list
  flushList("list-final");

  return <div>{elements}</div>;
}
