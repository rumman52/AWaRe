"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Msg = { who: "user" | "assistant"; text: string };

export default function ChatPage() {
  const params = useSearchParams();
  const caseIdFromQuery = params?.get("caseId") ?? undefined;

  const [mode, setMode] = useState<"case" | "general">(caseIdFromQuery ? "case" : "general");
  const [caseId, setCaseId] = useState<string | undefined>(caseIdFromQuery);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (caseIdFromQuery) {
      setMode("case");
      setCaseId(caseIdFromQuery);
    }
  }, [caseIdFromQuery]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { who: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, mode, caseId }),
      });
      const data = await res.json();

      if (data.answer) {
        setMessages((m) => [...m, { who: "assistant", text: data.answer }]);
      } else if (data.error) {
        if (data.error === "no_guide") {
          const details = `No guide found for setting=${data.setting} infectionKey=${data.infectionKey}. Please seed the DB or choose another infection/setting.`;
          setMessages((m) => [...m, { who: "assistant", text: details }]);
        } else {
          setMessages((m) => [...m, { who: "assistant", text: `Error: ${data.error}` }]);
        }
      } else {
        setMessages((m) => [...m, { who: "assistant", text: "No response from assistant." }]);
      }
    } catch {
      setMessages((m) => [...m, { who: "assistant", text: "Network or server error calling chat API." }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "28px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>AMR Assistant</h1>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 12 }}>
          <input type="radio" checked={mode === "case"} onChange={() => setMode("case")} /> About this case
        </label>
        <label>
          <input type="radio" checked={mode === "general"} onChange={() => setMode("general")} /> General health
        </label>
        <span style={{ marginLeft: 12, color: "#666" }}>{caseId ? `Case: ${caseId}` : ""}</span>
      </div>

      <div style={{ minHeight: 300, border: "1px solid #e6e6e6", padding: 12, borderRadius: 8, background: "#fafafa", marginBottom: 12 }}>
        {messages.length === 0 && <div style={{ color: "#666" }}>Ask a question to get started.</div>}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{m.who === "user" ? "You" : "Assistant"}</div>
            <div
              style={{
                background: m.who === "user" ? "#e6f7ff" : "#fff",
                padding: 10,
                borderRadius: 6,
                boxShadow: "0 0 0 1px #eee inset",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: "#666" }}>Thinking…</div>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ddd" }}
        />
        <button onClick={() => void sendMessage()} disabled={loading} style={{ padding: "10px 16px", borderRadius: 6 }}>
          Send
        </button>
      </div>

      <div style={{ marginTop: 12, color: "#666", fontSize: 13 }}>
        <strong>Disclaimer:</strong> Educational only — not medical advice. For clinical decisions, consult a clinician.
      </div>
    </div>
  );
}
