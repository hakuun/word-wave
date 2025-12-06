import { sendToBackground } from "@plasmohq/messaging"

import { CEFR_LEVELS } from "~constants"
import { TRANSLATE_AND_ANALYSIS } from "~constants/business"
import { TextMonitor } from "~lib"
import { getUserConfig, injectScript } from "~utils"

function getTranslateUserPrompt({
  CEFR,
  text
}: {
  CEFR: string
  text: string
}) {
  const currentIndex = CEFR_LEVELS.findIndex((level) => level === CEFR)
  const targetPlus = CEFR_LEVELS[currentIndex + 1]
  return `Please read the following Chinese text and perform appropriate word segmentation. For each term, provide an English translation, its CEFR level in English, and a concise but helpful detailed explanation. Only return terms that meet the target CEFR level ${CEFR} and ${CEFR}+1 (i.e., ${targetPlus}). Output as a strict JSON array, without adding any descriptions or extraneous text. Each object in the array should contain the following fields: original text, translation, CEFR level, and detailed explanation. Chinese:${text}`
}
// Set its source to the injected script file (e.g., history-hook.js)
injectScript("assets/history-hook.js") // Add it to the DOM to execute it immediately

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
  const userConfig = await getUserConfig()
  for (let i = 0; i < noTranslatedElements.length; i++) {
    const element = noTranslatedElements[i]
    const text = element.textContent || ""

    const resp = await sendToBackground({
      name: TRANSLATE_AND_ANALYSIS,
      body: { text }
    })

    console.log("resp:", resp)
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

main()
