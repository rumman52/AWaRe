"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ChatMode = "case" | "general";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatError = {
  error: string;
  setting?: string;
  infectionKey?: string;
};

export default function ChatPage() {
  const searchParams = useSearchParams();
  const caseIdFromQuery = searchParams.get("caseId") ?? "";

  const [mode, setMode] = useState<ChatMode>(caseIdFromQuery ? "case" : "general");
  const [caseId, setCaseId] = useState(caseIdFromQuery);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  useEffect(() => {
    setCaseId(caseIdFromQuery);
    if (caseIdFromQuery) {
      setMode("case");
    }
  }, [caseIdFromQuery]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          mode,
          caseId: mode === "case" ? caseId : undefined
        })
      });

      const payload = (await response.json()) as { answer?: string } & ChatError;

      if (!response.ok || !payload.answer) {
        setError({
          error: payload.error || "unknown_error",
          setting: payload.setting,
          infectionKey: payload.infectionKey
        });
        setMessages((prev) => [...prev, { role: "assistant", content: "I could not complete that request." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: payload.answer! }]);
    } catch {
      setError({ error: "network_error" });
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4">
      <section className="card space-y-3">
        <h1 className="text-xl font-semibold">AMR Steward Assistant</h1>
        <p className="text-sm text-slate-600">Educational only — not medical advice.</p>
        <div className="inline-flex rounded-lg border border-slate-200 p-1">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${mode === "case" ? "bg-blue-600 text-white" : "text-slate-700"}`}
            onClick={() => setMode("case")}
            disabled={!caseId}
            title={caseId ? "Use current case context" : "Open from a case page to enable case mode"}
          >
            About this case
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${mode === "general" ? "bg-blue-600 text-white" : "text-slate-700"}`}
            onClick={() => setMode("general")}
          >
            General health
          </button>
        </div>
        {mode === "case" && !caseId && (
          <p className="text-sm text-amber-700">No case selected. Open this page with a case query string (`/chat?caseId=...`).</p>
        )}
      </section>

      <section className="card space-y-3">
        <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
          {messages.length === 0 && <p className="text-sm text-slate-500">Ask a question to get started.</p>}
          {messages.map((messageItem, index) => (
            <div
              key={`${messageItem.role}-${index}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                messageItem.role === "user" ? "ml-auto max-w-[80%] bg-blue-600 text-white" : "max-w-[90%] bg-white text-slate-900"
              }`}
            >
              <p className="whitespace-pre-wrap">{messageItem.content}</p>
            </div>
          ))}
          {loading && <p className="text-sm text-slate-500">Assistant is thinking…</p>}
        </div>

        {error?.error === "no_guide" && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            No guide was found for this case context.
            {error.setting && error.infectionKey && (
              <span>
                {" "}Requested setting: <strong>{error.setting}</strong>, infection key: <strong>{error.infectionKey}</strong>.
              </span>
            )}
            <br />
            Please verify guide configuration or seed missing guide data.
          </div>
        )}

        {error && error.error !== "no_guide" && (
          <p className="text-sm text-red-700">Request failed: {error.error}. Please try again.</p>
        )}

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="input"
            placeholder={mode === "case" ? "Ask about this case" : "Ask a general AMR question"}
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || (mode === "case" && !caseId)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
