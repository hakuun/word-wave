/**
 * Interface for the configuration parameters required by the OpenAICaller.
 */
export interface IOpenAICallerConfig {
  /** The OpenAI API key. */
  apiKey?: string
  /** The custom base URL for the API (e.g., for self-hosted models or proxies). */
  baseURL?: string
  /** The model to use (e.g., 'gpt-4o', 'gpt-3.5-turbo'). */
  model?: string
  /** The initial system prompt to guide the model's behavior. */
  systemPrompt?: string
}

export interface UserConfig extends IOpenAICallerConfig {
  CEFR: string
  modelCompany: string
}
