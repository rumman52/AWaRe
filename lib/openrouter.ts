const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type OpenRouterChoice = {
  message?: { content?: string };
  text?: string;
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
};

function readAnswer(payload: OpenRouterResponse): string {
  const choice = payload.choices?.[0];
  const content = choice?.message?.content ?? choice?.text;

  if (!content || typeof content !== "string") {
    throw new Error("OpenRouter response missing assistant content");
  }

  return content.trim();
}

export async function createOpenRouterChatCompletion(input: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  reasoning?: { enabled: boolean };
}): Promise<string> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      temperature: input.temperature ?? 0.2,
      max_tokens: input.maxTokens ?? 600,
      reasoning: input.reasoning ?? { enabled: true }
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${details.slice(0, 300)}`);
  }

  const payload = (await response.json()) as OpenRouterResponse;
  return readAnswer(payload);
}
