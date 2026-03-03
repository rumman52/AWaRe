"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type ChatMode = "case" | "general";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatError = {
  error: string;
  setting?: string;
  infectionKey?: string;
};

const DISCLAIMER = "Disclaimer: Educational only — not medical advice. Consult a clinician for clinical decisions.";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const caseIdFromQuery = searchParams.get("caseId") ?? "";

  const [mode, setMode] = useState<ChatMode>(caseIdFromQuery ? "case" : "general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  useEffect(() => {
    if (caseIdFromQuery) setMode("case");
  }, [caseIdFromQuery]);

  const placeholder = useMemo(
    () => (mode === "case" ? "Ask about guideline-aligned options for this case" : "Ask a general stewardship question"),
    [mode]
  );

  const envBlocked = error?.error === "missing_openrouter_key";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading || envBlocked) return;

    setError(null);
    setIsLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode, caseId: mode === "case" ? caseIdFromQuery : undefined })
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
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-4">
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Clinical Chat Assistant</h1>
          <p className="mt-1 text-sm text-slate-600">AWaRe-safe guidance powered server-side with healthcare constraints.</p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1 text-sm">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 transition ${mode === "case" ? "bg-blue-700 text-white" : "text-slate-700"}`}
            onClick={() => setMode("case")}
            disabled={!caseIdFromQuery}
            title={caseIdFromQuery ? "Ground answers on this case" : "Open from case details to enable case mode"}
          >
            About this case
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 transition ${mode === "general" ? "bg-blue-700 text-white" : "text-slate-700"}`}
            onClick={() => setMode("general")}
          >
            General health
          </button>
        </div>
      </Card>

      {error?.error === "missing_openrouter_key" && (
        <Alert tone="warning">
          <p className="font-semibold">Chat setup required</p>
          <p className="mt-1">OPENROUTER_API_KEY is missing. Add it in your environment, restart the server, then retry. Sending is disabled until configured.</p>
        </Alert>
      )}

      {!caseIdFromQuery && mode === "case" && (
        <Alert tone="warning">No case context found. Open this page via <code>/chat?caseId=&lt;id&gt;</code> for case-grounded mode.</Alert>
      )}

      {error?.error === "no_guide" && (
        <Alert tone="warning">
          No guideline data found for this case. Setting: <strong>{error.setting}</strong> · Infection key: <strong>{error.infectionKey}</strong>
        </Alert>
      )}

      {error && !["no_guide", "missing_openrouter_key"].includes(error.error) && <Alert tone="error">Request failed: {error.error}</Alert>}

      <Card className="space-y-3">
        <div className="max-h-[480px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          {messages.length === 0 && <p className="text-sm text-slate-500">No messages yet. Ask about stewardship options, review timing, or resistance risks.</p>}
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === "user" ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-900"}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && <p className="text-sm text-slate-500">Thinking...</p>}
        </div>

        <form className="flex gap-2" onSubmit={onSubmit}>
          <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={placeholder} />
          <Button type="submit" disabled={isLoading || !input.trim() || (mode === "case" && !caseIdFromQuery) || envBlocked}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
          </Button>
        </form>
      </Card>

      <p className="text-xs text-slate-500">{DISCLAIMER}</p>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-4xl text-sm text-slate-500">Loading chat…</main>}>
      <ChatPageContent />
    </Suspense>
  );
}
