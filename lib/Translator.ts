/**
 * A robust wrapper for the Google Translate API, providing
 * rate limiting and logical segmentation of long texts.
 */
export class Translator {
  // Simple timestamp for rate limiting.
  private lastCallTime: number = 0

  // Minimum delay (in milliseconds) between API calls to prevent flooding/rate limiting issues
  private readonly RATE_LIMIT_DELAY_MS: number = 200

  // Maximum length of text segment for the Google Translate API (approximate safe limit)
  // We keep this limit high, but the segmentation logic will try to break it sooner at sentence ends.
  private readonly MAX_SEGMENT_LENGTH: number = 1000

  /**
   * Internal method to directly call the Google Translate API.
   */
  private async fetchTranslation(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&dt=at&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Translation API failed with status: ${response.status}`)
    }
    const data = await response.json()

    // The API returns an array of segments (data[0]). We map and join them.
    const translatedText = data[0].map((segment: any) => segment[0]).join("")

    return translatedText
  }

  /**
   * Logically segments a long text into smaller chunks based on sentence boundaries
   * ('.', '?', '!') to preserve translation quality.
   */
  private segmentLongText(text: string): string[] {
    const segments: string[] = []
    let currentText = text

    // Loop until all text is segmented
    while (currentText.length > 0) {
      // If the remaining text is short enough, take it and finish.
      if (currentText.length <= this.MAX_SEGMENT_LENGTH) {
        segments.push(currentText)
        break
      }

      // 1. Find the last sentence-ending punctuation mark ('.', '?', '!')
      const segmentCandidate = currentText.substring(0, this.MAX_SEGMENT_LENGTH)

      // Look for the last sentence boundary that is followed by a space or is at the end of the segmentCandidate
      const sentenceBoundaryIndex = segmentCandidate.search(/[\.\?\!](?:\s|$)/g)

      let splitIndex = -1

      if (sentenceBoundaryIndex > 0) {
        // Found a boundary. Use the position of the punctuation mark + 1 for the space after it
        // Or just the position if it's the last character.
        // The regex search gives the index of the first character of the match (., ?, or !)
        splitIndex = segmentCandidate.lastIndexOf(".", segmentCandidate.length)
        splitIndex = Math.max(
          splitIndex,
          segmentCandidate.lastIndexOf("?", segmentCandidate.length)
        )
        splitIndex = Math.max(
          splitIndex,
          segmentCandidate.lastIndexOf("!", segmentCandidate.length)
        )

        // Move past the punctuation and any subsequent whitespace
        splitIndex = splitIndex + 1
        while (
          splitIndex < currentText.length &&
          currentText[splitIndex] === " "
        ) {
          splitIndex++
        }
      } else {
        // 2. If no clear sentence break is found within the limit, fall back to a hard break
        //    (This is less ideal but necessary to respect the API limit).
        console.warn(
          "No clear sentence break found. Performing a hard text split."
        )
        splitIndex = this.MAX_SEGMENT_LENGTH
      }

      // Extract the segment and update the remaining text
      const segment = currentText.substring(0, splitIndex)
      segments.push(segment)
      currentText = currentText.substring(splitIndex).trimStart()
    }

    return segments
  }

  /**
   * Main translation method with rate limiting and long text segmentation.
   * @param text The text to translate.
   * @param options Translation options (sourceLang, targetLang).
   * @returns The translated text.
   */
  public async translate(
    text: string,
    { sourceLang = "auto", targetLang = "en" } = {}
  ): Promise<string> {
    // 1. Rate Limiting Check
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCallTime

    if (timeSinceLastCall < this.RATE_LIMIT_DELAY_MS) {
      const waitTime = this.RATE_LIMIT_DELAY_MS - timeSinceLastCall
      console.log(`Rate limit approaching. Waiting ${waitTime}ms...`)
      // Wait for the remaining time before making the call
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }

    // --- Core Translation Logic ---

    let segments: string[]

    if (text.length > this.MAX_SEGMENT_LENGTH) {
      // 2. Logical Segmentation for Long Texts
      console.log("Text too long. Segmenting for translation...")
      segments = this.segmentLongText(text)
    } else {
      // Single Segment
      segments = [text]
    }

    const translatedSegments: string[] = []

    for (const segment of segments) {
      try {
        const translatedSegment = await this.fetchTranslation(
          segment,
          sourceLang,
          targetLang
        )
        translatedSegments.push(translatedSegment)

        // Update last call time *after* each successful API call
        this.lastCallTime = Date.now()
      } catch (error) {
        console.error("Segment translation failed:", error)
        // Throw or return a partial result/error depending on desired behavior
        throw new Error(
          `Failed to translate segment: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }
    }

    // Join the translated segments back into a single text
    return translatedSegments.join("")
  }
}
