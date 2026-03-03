"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type ChatMode = "case" | "general";
type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatError = { error: string; setting?: string; infectionKey?: string };

const suggestedQuestions = [
  "What does AWaRe mean in this recommendation?",
  "How should I document a 48–72h review plan?",
  "When should Watch antibiotics be avoided?"
];

export function ChatPanel({ latestCaseId, preferredMode }: { latestCaseId: string; preferredMode?: ChatMode }) {
  const [mode, setMode] = useState<ChatMode>(preferredMode ?? "general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  const placeholder = useMemo(
    () => (mode === "case" ? "Ask about this case context" : "Ask a general stewardship question"),
    [mode]
  );

  useEffect(() => {
    if (!preferredMode) return;
    setMode(preferredMode);
  }, [preferredMode]);

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
        body: JSON.stringify({ message, mode, caseId: mode === "case" ? latestCaseId : undefined })
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-lg font-semibold"><Bot className="h-5 w-5 text-indigo-600" /> AMR Assistant</p>
          <p className="text-xs text-slate-500">Educational support only. Confirm clinical decisions with a licensed clinician.</p>
        </div>
        <div className="inline-flex w-full rounded-xl border border-teal-200 bg-teal-50 p-1 text-sm sm:w-auto">
          <button type="button" className={`flex-1 rounded-lg px-3 py-1.5 text-center sm:flex-none ${mode === "case" ? "bg-indigo-600 text-white" : "text-slate-700"}`} onClick={() => setMode("case")}>About this case</button>
          <button type="button" className={`flex-1 rounded-lg px-3 py-1.5 text-center sm:flex-none ${mode === "general" ? "bg-indigo-600 text-white" : "text-slate-700"}`} onClick={() => setMode("general")}>General education</button>
        </div>
      </div>

      {mode === "case" && !latestCaseId && <Alert tone="warning">No case context yet. Generate a recommendation in New Case first, then return here.</Alert>}
      {error?.error === "missing_openrouter_key" && <Alert tone="warning">OPENROUTER_API_KEY is missing. Add it to environment variables to enable chat responses.</Alert>}
      {error && error.error !== "missing_openrouter_key" && <Alert tone="warning">Request warning: {error.error}</Alert>}

      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((chip) => (
          <button key={chip} type="button" onClick={() => setInput(chip)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-teal-300 hover:bg-teal-50">
            {chip}
          </button>
        ))}
      </div>

      <div className="max-h-[55vh] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:max-h-[430px] sm:p-4">
        {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet. Try one of the suggested prompts to get started.</p>}
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[85%] sm:px-4 ${msg.role === "user" ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-900"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <p className="text-sm text-slate-500"> <Loader2 className="mr-1 inline h-4 w-4 animate-spin" /> Thinking...</p>}
      </div>

      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
        <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
        <Button className="w-full sm:w-auto" type="submit" disabled={isLoading || !input.trim() || (mode === "case" && !latestCaseId)}>
          <Send className="h-4 w-4" /> Send
        </Button>
      </form>
    </div>
  );
}
