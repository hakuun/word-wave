import { Storage } from "@plasmohq/storage"

import type { UserConfig } from "~types"

const storage = new Storage()

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

export async function getUserConfig(): Promise<UserConfig> {
  return await storage.get("userConfig")
}
