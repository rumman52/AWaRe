"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
    if (caseIdFromQuery) {
      setMode("case");
    }
  }, [caseIdFromQuery]);

  const placeholder = useMemo(
    () => (mode === "case" ? "Ask about guideline-aligned options for this case" : "Ask a general stewardship question"),
    [mode]
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message || isLoading) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          mode,
          caseId: mode === "case" ? caseIdFromQuery : undefined
        })
      });

      const payload = (await response.json()) as { answer?: string } & ChatError;

      if (!response.ok || !payload.answer) {
        const nextError: ChatError = {
          error: payload.error || "unknown_error",
          setting: payload.setting,
          infectionKey: payload.infectionKey
        };
        setError(nextError);

        if (nextError.error !== "missing_openrouter_key") {
          setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I could not complete that request." }]);
        }

        return;
      }

      const answer = payload.answer;
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setError({ error: "network_error" });
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-4">
      <section className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Clinical Chat Assistant</h1>
          <p className="text-sm text-slate-600">OpenRouter + Arcee Trinity (server-side) with stewardship safety rules.</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-300 p-1 text-sm">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${mode === "case" ? "bg-blue-600 text-white" : "text-slate-700"}`}
            onClick={() => setMode("case")}
            disabled={!caseIdFromQuery}
            title={caseIdFromQuery ? "Ground answers on this case" : "Open from case details to enable case mode"}
          >
            About this case
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 ${mode === "general" ? "bg-blue-600 text-white" : "text-slate-700"}`}
            onClick={() => setMode("general")}
          >
            General health
          </button>
        </div>
      </section>

      {!caseIdFromQuery && mode === "case" && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          No case context found. Open a case-specific chat via <code>/chat?caseId=&lt;id&gt;</code>.
        </section>
      )}

      {error?.error === "no_guide" && (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          No guideline data was found for this case.
          <div className="mt-1">
            Setting: <strong>{error.setting}</strong> · Infection key: <strong>{error.infectionKey}</strong>
          </div>
          <div className="mt-1">Please add a matching InfectionGuide entry before retrying.</div>
        </section>
      )}

      {error && error.error !== "no_guide" && (
        <section className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">Request failed: {error.error}</section>
      )}

      {error?.error === "missing_openrouter_key" && (
        <section className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Chat is not configured on this deployment yet.</p>
          <ol className="ml-5 mt-2 list-decimal space-y-1">
            <li>In Vercel, set <code>OPENROUTER_API_KEY</code> in Project → Settings → Environment Variables.</li>
            <li>Add it to both <strong>Preview</strong> and <strong>Production</strong>.</li>
            <li>Redeploy, then refresh this page.</li>
          </ol>
        </section>
      )}

      <section className="card space-y-3">
        <div className="max-h-[480px] space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          {messages.length === 0 && <p className="text-sm text-slate-500">Start a conversation to see responses here.</p>}

          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-900 border border-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && <p className="text-sm text-slate-500">Assistant is thinking…</p>}
        </div>

        <form className="flex gap-2" onSubmit={onSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={placeholder}
            className="input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || (mode === "case" && !caseIdFromQuery)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Send
          </button>
        </form>
      </section>

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
