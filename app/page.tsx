"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, FileText, Sparkles } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Source = {
  page: number | string;
  snippet: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

const SUGGESTIONS = [
  "What is the leave policy?",
  "How do I report a complaint?",
  "What are the working hours?",
  "What benefits am I entitled to?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  async function sendMessage(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to reach the server. Please ensure the backend is running and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#fafaf9",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .serif { font-family: 'Lora', serif; }

        textarea:focus { outline: none; }
        textarea::placeholder { color: #a8a29e; }

        .dot-bounce { animation: bounce 1.2s ease-in-out infinite; }
        .dot-bounce:nth-child(2) { animation-delay: 0.2s; }
        .dot-bounce:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }

        .pulse-dot { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .sug-btn {
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #78716c;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
          line-height: 1.4;
        }
        .sug-btn:hover {
          border-color: #d6d3d1;
          background: #fafaf9;
          color: #292524;
        }

        .msg-enter {
          animation: fadeUp 0.2s ease-out forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .send-btn {
          background: #00d1b2;
          border: none;
          border-radius: 9px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }
        .send-btn:hover { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.4; cursor: default; }

        .reset-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #a8a29e;
          padding: 8px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .reset-btn:hover { background: #f5f5f4; color: #57534e; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 99px; }
      `}</style>

      {/* ── Header ── */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid #e7e5e4",
          padding: "0 24px",
          height: "90px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 38,
            height: 38,
            background: "#00d1b2",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 14 14">
            <rect x="1" y="1" width="5" height="5" fill="white" />
            <rect x="8" y="1" width="5" height="5" fill="white" opacity="0.5" />
            <rect x="1" y="8" width="5" height="5" fill="white" opacity="0.5" />
            <rect x="8" y="8" width="5" height="5" fill="white" opacity="0.2" />
          </svg>
        </div>

        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 16, color: "#1c1917", lineHeight: 1.2 }}>
            Amrood Labs
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#a8a29e",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            HR Knowledge Assistant
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "#78716c",
          }}
        >
          <span
            className="pulse-dot"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#34d399",
              display: "inline-block",
            }}
          />
          Online
        </div>
      </header>

      {/* ── Scrollable body ── */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            margin: "0 auto",
            padding: "32px 24px 24px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ── Empty state ── */}
          {messages.length === 0 && !loading && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 28,
                paddingBottom: 48,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "white",
                    border: "1px solid #e7e5e4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 18px",
                  }}
                >
                  <FileText size={22} color="#a8a29e" />
                </div>
                <h1
                  className="serif"
                  style={{
                    fontSize: 26,
                    color: "#1c1917",
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  Employee Handbook
                </h1>
                <p
                  style={{
                    fontSize: 13,
                    color: "#a8a29e",
                    margin: "8px 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Ask about leave, benefits, working hours, complaints, and more.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  width: "100%",
                  maxWidth: 440,
                }}
              >
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="sug-btn"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className="msg-enter"
                style={{
                  display: "flex",
                  gap: 10,
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-start",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: msg.role === "user" ? "#1c1917" : "white",
                    border: msg.role === "assistant" ? "1px solid #e7e5e4" : "none",
                  }}
                >
                  {msg.role === "assistant" && (
                    <Sparkles size={12} color="#a8a29e" />
                  )}
                </div>

                {/* Bubble + sources */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                    maxWidth: "75%",
                    alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={
                      msg.role === "user"
                        ? {
                            background: "#1c1917",
                            color: "white",
                            padding: "10px 15px",
                            borderRadius: "14px 4px 14px 14px",
                            fontSize: 14,
                            lineHeight: 1.6,
                          }
                        : {
                            background: "white",
                            color: "#292524",
                            border: "1px solid #e7e5e4",
                            padding: "10px 15px",
                            borderRadius: "4px 14px 14px 14px",
                            fontSize: 14,
                            lineHeight: 1.6,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                          }
                    }
                  >
                    {msg.content}
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#a8a29e",
                        paddingLeft: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {msg.sources.map((s, j) => (
                        <span key={j}>
                          Page {s.page} — {s.snippet}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div
                className="msg-enter"
                style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                    border: "1px solid #e7e5e4",
                  }}
                >
                  <Sparkles size={12} color="#a8a29e" />
                </div>
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e7e5e4",
                    borderRadius: "4px 14px 14px 14px",
                    padding: "13px 16px",
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="dot-bounce"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#d6d3d1",
                        display: "inline-block",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </main>

      {/* ── Input bar ── */}
      <div
        style={{
          background: "white",
          borderTop: "1px solid #e7e5e4",
          padding: "12px 24px 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          {/* Reset button — only visible when there are messages */}
          {messages.length > 0 && (
            <button
              className="reset-btn"
              onClick={() => setMessages([])}
              title="Clear conversation"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {/* Textarea wrapper */}
          <div
            style={{
              flex: 1,
              background: "#f5f5f4",
              border: "1px solid #e7e5e4",
              borderRadius: 12,
              display: "flex",
              alignItems: "flex-end",
              padding: "0 12px",
              gap: 8,
              transition: "border-color 0.15s",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "#d6d3d1")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "#e7e5e4")
            }
          >
            <textarea
              ref={textareaRef}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask anything…"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "#292524",
                padding: "10px 0",
                resize: "none",
                lineHeight: 1.5,
                maxHeight: 140,
              }}
            />
          </div>

          {/* Send button */}
          <button
            className="send-btn"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
          >
            <Send size={14} color="white" />
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#d6d3d1",
            margin: "10px 0 0",
          }}
        >
          Answers are based on the Amrood Labs employee handbook.
        </p>
      </div>
    </div>
  );
}