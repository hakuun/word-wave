export interface LLMProvider {
  /** The human-readable name of the major model company. */
  company: string
  /** The OpenAPI-compliant base URL (typically ending in /v1 or the base). */
  baseUrl: string
  /** A list of available models for chat completions under this provider. */
  models: string[]
}
