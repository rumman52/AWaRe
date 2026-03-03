"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type ChatMode = "case" | "general";
type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatError = { error: string; setting?: string; infectionKey?: string };

export function ChatPanel() {
  const [mode, setMode] = useState<ChatMode>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  const placeholder = useMemo(
    () => (mode === "case" ? "Ask about guideline-aligned options for this case" : "Ask a general stewardship question"),
    [mode]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setError(null);
    setIsLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode })
      });
      const payload = (await response.json()) as { answer?: string } & ChatError;

      if (!response.ok || !payload.answer) {
        setError({ error: payload.error || "unknown_error", setting: payload.setting, infectionKey: payload.infectionKey });
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I could not complete that request." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: payload.answer as string }]);
    } catch {
      setError({ error: "network_error" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-lg font-semibold"><Bot className="h-5 w-5 text-indigo-600" /> AMR Assistant</p>
          <p className="text-xs text-slate-500">Decision support only. Confirm all clinical actions with a licensed clinician.</p>
        </div>
        <div className="inline-flex rounded-xl border border-teal-200 bg-teal-50 p-1 text-sm">
          <button type="button" className={`rounded-lg px-3 py-1.5 ${mode === "case" ? "bg-indigo-600 text-white" : "text-slate-700"}`} onClick={() => setMode("case")}>Case mode</button>
          <button type="button" className={`rounded-lg px-3 py-1.5 ${mode === "general" ? "bg-indigo-600 text-white" : "text-slate-700"}`} onClick={() => setMode("general")}>General</button>
        </div>
      </div>

      {error && <Alert tone="warning">Request warning: {error.error}</Alert>}

      <div className="max-h-[480px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
        {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet. Ask about stewardship options, review timing, or resistance risks.</p>}
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === "user" ? "bg-indigo-100 text-indigo-900" : "border-l-4 border-l-teal-400 border border-slate-200 bg-white text-slate-900"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <p className="text-sm text-slate-500">Thinking...</p>}
      </div>

      <form className="flex gap-2" onSubmit={onSubmit}>
        <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
        <Button type="submit" disabled={isLoading || !input.trim()}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send</Button>
      </form>
    </Card>
  );
}
