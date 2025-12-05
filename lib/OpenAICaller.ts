import OpenAI from "openai"

import type { ChatCompletionCreateParamsBase } from "~node_modules/openai/resources/chat/completions"
import type { IOpenAICallerConfig } from "~types/config"

/**
 * A generic class for calling the OpenAI Chat Completions API with customizable
 * configuration and prompt.
 */
export class OpenAICaller {
  private config: IOpenAICallerConfig
  private openai: OpenAI

  /**
   * Initializes the caller with the necessary configuration.
   * @param config The configuration object including API key, baseURL, model, and system prompt.
   */
  constructor(config: IOpenAICallerConfig) {
    this.config = config

    // Initialize the OpenAI client with the provided API key and optional base URL.
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      // Note: browser runtime requires "dangerouslyAllowBrowser" to be true,
      // but this should be used with extreme caution if the API key is exposed.
      // For a browser extension, keys are often proxied or stored securely.
      // If running in a secure Service Worker context and not exposing the key
      // to the content script/browser UI, this may be acceptable.
      dangerouslyAllowBrowser: true
    })
  }

  /**
   * Executes the API call to get a chat completion based on the stored
   * system prompt and a new user prompt.
   * * @param userPrompt The specific prompt from the user for this request.
   * @returns A promise that resolves to the model's response text.
   */
  public async call(userPrompt: string): Promise<string> {
    const messages: ChatCompletionCreateParamsBase["messages"] = [
      { role: "system", content: this.config.systemPrompt },
      { role: "user", content: userPrompt }
    ]

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: messages
        // Add any other desired parameters (e.g., temperature, max_tokens) here
      })

      // Extract the model's response text from the completion object
      const responseText = completion.choices[0].message.content

      if (responseText === null) {
        return "Error: Model returned an empty response."
      }

      return responseText
    } catch (error) {
      console.error("OpenAI API call failed:", error)
      // Re-throw a more user-friendly error or handle it as needed for the extension
      throw new Error("Failed to get a response from the large language model.")
    }
  }
}
