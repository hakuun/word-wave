import type { Token } from "~assets/jieba/jieba_rs_wasm"

/**
 * Injects a script file from the extension's context into the webpage's context.
 * The script must be listed in manifest.json under 'web_accessible_resources'.
 */
export function injectScript(scriptFileName: string) {
  // 1. Get the full accessible URL for the script file
  const scriptUrl = chrome.runtime.getURL(scriptFileName)

  // 2. Create the script element
  const script = document.createElement("script")
  script.src = scriptUrl
  script.type = "text/javascript"

  // 3. Append to the DOM to execute
  const target = document.head || document.documentElement
  target.appendChild(script)

  // Optional: Remove the script tag once it loads to keep the DOM clean
  script.onload = () => {
    script.remove()
    console.log(`Successfully injected and removed: ${scriptFileName}`)
  }
}

/**
 * Gets the longest non-overlapping sequence of tokens from a list of all possible tokens,
 * using a greedy longest-match approach.
 *
 * @param allTokens An array of all possible overlapping tokens with start/end indices.
 * @returns An array of tokens representing the longest-match segmentation.
 */
export function getLongestSentences(tokens: Token[]): Token[] {
  if (tokens.length === 0) {
    return []
  }

  // 按start升序，end降序排序
  const sortedTokens = [...tokens].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    return b.end - a.end
  })

  const result: Token[] = []
  let currentEnd = -1

  for (const token of sortedTokens) {
    // 如果当前token的start >= currentEnd，说明不重叠
    if (token.start >= currentEnd) {
      result.push(token)
      currentEnd = token.end
    }
  }

  return result
}


export async function getWords(text: string) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "segment_text",
        text: text
      },
      (response) => {
        if (response && response.words) {
          resolve(response.words)
        } else {
          reject(new Error("Failed to get words"))
        }
      }
    )
  })
}