import { TextMonitor, Translator } from "~lib"
import { injectScript } from "~utils"

// Set its source to the injected script file (e.g., history-hook.js)
injectScript("assets/history-hook.js") // Add it to the DOM to execute it immediately
const translator = new Translator()

//  Define the callback function ---
async function handleVisibleElementsUpdate(elements: HTMLElement[]) {
  // This function runs every time an element enters or leaves the viewport
  const visibleCount = elements.length

  // Example: Update a UI element or send data to an analytics service
  console.log(
    `Real-time update: ${visibleCount} text elements are currently visible.`
  )
  elements.forEach(async (element) => {
    console.log(element.textContent)
    const translatedText = await translator.translate(
      element.textContent || "",
      { targetLang: "en" }
    )
    console.log(translatedText)
    // TODO: element 处理后增加标记
  })
}

function main() {
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

main()
