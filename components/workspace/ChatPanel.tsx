"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type ChatMode = "case" | "general";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatPanel({ caseId }: { caseId?: string }) {
  const [mode, setMode] = useState<ChatMode>(caseId ? "case" : "general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const placeholder = useMemo(() => mode === "case" ? "Ask about this generated case" : "Ask a general stewardship question", [mode]);
  const missingKey = error === "missing_openrouter_key";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading || missingKey) return;

    setError("");
    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode, caseId: mode === "case" ? caseId : undefined })
      });
      const payload = await response.json();

      if (!response.ok || !payload.answer) {
        setError(payload.error || "request_failed");
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I could not complete that request." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: payload.answer }]);
    } catch {
      setError("network_error");
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-t-4 border-t-teal-500">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700"><Bot className="h-4 w-4" /> AMR Assistant</p>
            <h2 className="section-title mt-1">Chat Assistant</h2>
          </div>
          <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1 text-sm">
            <button type="button" className={`rounded-lg px-3 py-1.5 ${mode === "case" ? "bg-indigo-600 text-white" : "text-slate-700"}`} disabled={!caseId} onClick={() => setMode("case")}>About this case</button>
            <button type="button" className={`rounded-lg px-3 py-1.5 ${mode === "general" ? "bg-indigo-600 text-white" : "text-slate-700"}`} onClick={() => setMode("general")}>General health</button>
          </div>
        </div>
      </Card>

      {missingKey && <Alert tone="warning">OPENROUTER_API_KEY is missing. Configure it and restart to enable chat.</Alert>}
      {mode === "case" && !caseId && <Alert tone="warning">No generated case context yet. Generate a recommendation first, or switch to General health.</Alert>}
      {error && !["missing_openrouter_key"].includes(error) && <Alert tone="error">Request failed: {error}</Alert>}

      <Card className="border-t-4 border-t-indigo-500 space-y-3">
        <div className="max-h-[480px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          {messages.length === 0 ? <p className="text-sm text-slate-500">Ask about stewardship choices, review timing, and safety flags.</p> : null}
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === "user" ? "bg-indigo-100 text-indigo-900" : "border-l-4 border-l-teal-500 bg-white text-slate-900 border border-slate-200"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading ? <p className="text-sm text-slate-500">Thinking...</p> : null}
        </div>

        <form className="flex gap-2" onSubmit={onSubmit}>
          <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
          <Button type="submit" disabled={loading || !input.trim() || missingKey}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</Button>
        </form>
      </Card>
    </div>
  );
}
