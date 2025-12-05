import { TextMonitor, Translator } from "~lib"
import { getWords, injectScript } from "~utils"

// Set its source to the injected script file (e.g., history-hook.js)
injectScript("assets/history-hook.js") // Add it to the DOM to execute it immediately
const translator = new Translator()

//  Define the callback function ---
async function handleVisibleElementsUpdate(elements: HTMLElement[]) {
  // This function runs every time an element enters or leaves the viewport
  const visibleCount = elements.length
  const noTranslatedElements = elements.filter(
    (element) => !element.hasAttribute("data-ww-translated")
  )
  // Example: Update a UI element or send data to an analytics service
  console.log(
    `Real-time update: ${visibleCount} text elements are currently visible.`
  )
  console.log(
    `Real-time update: ${noTranslatedElements?.length} text elements are need translate.`
  )
  for (let i = 0; i < noTranslatedElements.length; i++) {
    const element = noTranslatedElements[i]
    const text = element.textContent || ""
    // console.log("text:", text)
    // const words = await getWords(text)
    // console.log("words:", words)

    // const translatedText = await translator.translate(element.textContent || "")
    // console.log(translatedText)
    // const classified = await tokenClassify.segment(element.textContent || "")
    // const source_sentence = classified.segmentation
    // const target_sentence = translatedText.split(" ")
    // const { alignment } = await tokenClassify.align({
    //   source_sentence,
    //   target_sentence
    // })
    // for (const [s_i, t_i] of alignment) {
    //   console.log("align:", source_sentence[s_i], target_sentence[t_i])
    // }
    // 翻译后增加标记
    element.setAttribute("data-ww-translated", "true")
  }
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
