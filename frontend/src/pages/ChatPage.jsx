import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/dashboard/Sidebar";
import MobileNav from "../components/dashboard/MobileNav";
import { chatAPI } from "../utils/api";
import { Send, Sparkles, Bot } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MarkdownText from "../components/dashboard/MarkdownText";

const SUGGESTIONS = [
  "What colors suit my skin tone?",
  "What should I wear to a job interview?",
  "How do I style a white shirt?",
  "What accessories go with a Minimalist look?",
  "Suggest an outfit for a beach vacation",
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef();

  const defaultGreeting = {
    role: "bot",
    content: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your StyleSense AI stylist. Ask me anything about fashion, outfits, or how to dress for any occasion.`,
  };

  // Fetch chat history from DB
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const res = await chatAPI.getHistory(search);
        const formatted = res.data.history.map((m) => ({
          role: m.role === "assistant" ? "bot" : "user",
          content: m.message,
        }));
        
        if (formatted.length > 0 || search) {
          setMessages(formatted);
        } else {
          setMessages([defaultGreeting]);
        }
      } catch (err) {
        console.error("Could not load chat history:", err);
        setMessages([defaultGreeting]);
      } finally {
        setHistoryLoading(false);
      }
    };
    if (user) {
      fetchHistory();
    }
  }, [search, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setInput("");
    const userMsg = { role: "user", content: msg };
    
    // Clear search filter so the user can see their sent message and response
    if (search) {
      setSearch("");
    }

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Build context history for LLM (excluding greetings or system messages)
    const history = messages
      .filter((m) => m.content !== defaultGreeting.content)
      .map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));

    try {
      const res = await chatAPI.message(msg, history);
      setMessages((prev) => [...prev, { role: "bot", content: res.data.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, I'm having trouble right now. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <MobileNav />
      <main className="main-content" style={{ display: "flex", flexDirection: "column" }}>
        <div className="page-header" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2>Style Chat</h2>
            <p>Ask your AI stylist anything about fashion and personal style.</p>
          </div>
          <div style={{ display: "flex", gap: 8, maxWidth: "300px", width: "100%", position: "relative" }}>
            <input
              className="form-input"
              placeholder="Search chat history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "8px 12px", paddingRight: 36, fontSize: "0.85rem", borderRadius: "8px" }}
            />
          </div>
        </div>

        <div className="chat-container">
          {/* Messages */}
          <div className="chat-messages">
            {historyLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <div className="spinner" style={{ width: "24px", height: "24px" }} />
              </div>
            ) : messages.length === 0 && search ? (
              <div className="empty-state">
                <h3>No messages found</h3>
                <p>Try searching for a different keyword or question.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  {msg.role === "bot" && (
                    <div className="chat-avatar" style={{ background: "rgba(212,168,67,0.15)" }}>
                      <Sparkles size={16} style={{ color: "var(--accent)" }} />
                    </div>
                  )}
                  <div className="chat-bubble">
                    {msg.role === "bot" ? (
                      <MarkdownText text={msg.content} />
                    ) : (
                      <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="chat-message bot">
                <div className="chat-avatar" style={{ background: "rgba(212,168,67,0.15)" }}>
                  <Sparkles size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div className="chat-bubble pulse" style={{ color: "var(--text-muted)" }}>
                  Thinking...
                </div>
              </div>
            )}

            {/* Suggestions (shown only when greeting is the only message) */}
            {messages.length === 1 && messages[0].content === defaultGreeting.content && !historyLoading && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="chip"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-bar">
            <input
              className="form-input"
              placeholder="Ask about fashion, outfits, colors..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ flexShrink: 0 }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}