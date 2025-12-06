import { sendToBackground } from "@plasmohq/messaging"

import { TextMonitor } from "~lib"
import { injectScript } from "~utils"

// Set its source to the injected script file (e.g., history-hook.js)
injectScript("assets/history-hook.js") // Add it to the DOM to execute it immediately

//  Define the callback function ---
async function handleVisibleElementsUpdate(elements: HTMLElement[]) {
  // This function runs every time an element enters or leaves the viewport
  const needTranslatedElements = elements.filter((element) => {
    if (!element || !element.textContent) return false
    if (element.textContent.length < 20) return false
    return !element.hasAttribute("data-ww-translated")
  })
  // Example: Update a UI element or send data to an analytics service
  console.log(
    `Real-time update: ${needTranslatedElements?.length} text elements are need translate.`
  )
  for (let i = 0; i < needTranslatedElements.length; i++) {
    const element = needTranslatedElements[i]
    const text = element.textContent || ""

    const resp = await sendToBackground({
      name: "translate",
      body: { CEFR: "A2", text }
    })

    if (resp?.message) {
      try {
        const message = JSON.parse(resp.message) || []
        console.log("message:", message)
        if (message.length) {
          message.forEach((item: any) => {
            element.innerHTML = element.innerHTML.replace(
              item.original_text,
              `<span data-ww-translated="true" title="${item.explanation_translation}">
              <span style="text-decoration: underline;">${item.original_text}</span>
              (${item.translation})</span>`
            )
          })
          element.setAttribute("data-ww-translated", "true")
        }
      } catch (error) {
        console.error("Error parsing JSON:", error)
        continue
      }
    }

    // 翻译后增加标记
    element.setAttribute("data-ww-translated", "true")
  }
}

async function main() {
  try {
    //  Instantiate the monitor ---
    const monitor = new TextMonitor(handleVisibleElementsUpdate)

    // Start the monitoring process
    monitor.start()

    // The event will fire for pushState, replaceState, popstate, AND hashchange. power by history-hook
    window.addEventListener("routechange", () => {
      // reset the monitor when route change
      monitor.reset()
    })
  } catch (error) {
    console.error("Error in main:", error)
  }
}

// main()
