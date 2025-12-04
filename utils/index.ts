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
