export interface LLMProvider {
  /** The human-readable name of the major model company. */
  company: string
  /** The OpenAPI-compliant base URL (typically ending in /v1 or the base). */
  baseUrl: string
  /** A list of available models for chat completions under this provider. */
  models: string[]
}

export const MAJOR_LLM_PROVIDERS: LLMProvider[] = [
  {
    company: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]
  },
  {
    company: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    models: [
      "claude-3-opus-20240229",
      "claude-3-sonnet-20240229",
      "claude-3.5-sonnet"
    ]
  },
  {
    company: "Moonshot AI (Kimi)",
    baseUrl: "https://api.moonshot.cn/v1",
    models: ["kimi-k2-turbo-preview", "kimi-k1.5", "moonshot-v1-128k"]
  },
  {
    company: "DeepSeek AI",
    baseUrl: "https://api.deepseek.com",
    models: ["deepseek-chat", "deepseek-reasoner"]
  },
  {
    company: "Google (Gemini - OpenAI Compatible)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"]
  },
  {
    company: "Mistral AI",
    baseUrl: "https://api.mistral.ai/v1",
    models: [
      "mistral-large-2402",
      "mistral-medium-2312",
      "mixtral-8x7b-instruct-v0.1"
    ]
  }
]
