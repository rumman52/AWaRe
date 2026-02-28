const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

type ChatRole = "system" | "user" | "assistant";

type ReasoningConfig = {
  enabled: boolean;
};

type OpenRouterMessage = {
  role: ChatRole;
  content: string;
  reasoning_details?: unknown;
};

type OpenRouterChoice = {
  message: OpenRouterMessage;
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
};

function getAssistantMessage(payload: OpenRouterResponse): OpenRouterMessage {
  const message = payload.choices?.[0]?.message;
  if (!message) {
    throw new Error("OpenRouter response did not include choices[0].message");
  }

  return message;
}

async function createCompletion(input: {
  apiKey: string;
  model: string;
  messages: OpenRouterMessage[];
  reasoning?: ReasoningConfig;
}): Promise<OpenRouterMessage> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: input.model,
      messages: input.messages,
      reasoning: input.reasoning
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OpenRouterResponse;
  return getAssistantMessage(payload);
}

/**
 * Performs a first reasoning-enabled completion and a follow-up request that
 * preserves assistant reasoning_details to continue the model's chain.
 */
export async function runReasoningFollowUp(input: {
  apiKey: string;
  model: string;
  prompt: string;
  followUpPrompt: string;
}): Promise<OpenRouterMessage> {
  const firstAssistantMessage = await createCompletion({
    apiKey: input.apiKey,
    model: input.model,
    messages: [{ role: "user", content: input.prompt }],
    reasoning: { enabled: true }
  });

  const continuedConversation: OpenRouterMessage[] = [
    { role: "user", content: input.prompt },
    {
      role: "assistant",
      content: firstAssistantMessage.content,
      reasoning_details: firstAssistantMessage.reasoning_details
    },
    { role: "user", content: input.followUpPrompt }
  ];

  return createCompletion({
    apiKey: input.apiKey,
    model: input.model,
    messages: continuedConversation
  });
}
