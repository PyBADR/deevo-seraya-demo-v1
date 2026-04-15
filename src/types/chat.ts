// ─────────────────────────────────────────────────────────────
// Chat types — Staff Chat + OpenAI integration
// ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  messages: { role: "user" | "assistant"; content: string }[];
  contextMode?: "staff" | "gift" | "scenario" | "brief";
  role?: string;
}

export interface ChatResponse {
  message: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StarterPrompt {
  label: string;
  message: string;
}
