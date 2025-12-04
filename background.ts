// 1. Import the JS glue code from your package (adjust path as needed)
import init, { cut } from "./assets/jieba/jieba_rs_wasm.js"

// 2. Define an async function to load the Wasm module
async function initializeJieba() {
  try {
    // Get the absolute URL for the WASM file within the extension bundle
    const wasmPath = chrome.runtime.getURL("assets/jieba/jieba_rs_wasm_bg.wasm")

    console.log("wasmPath", wasmPath)
    // Call the init function, passing the Wasm file path
    await init(wasmPath)
    console.log("Jieba WASM module initialized successfully.")
  } catch (error) {
    console.error("Failed to initialize Jieba WASM:", error)
  }
}

// 3. Initialize it immediately
initializeJieba()

// 4. Example function to expose to other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "segment_text" && message.text) {
    // The 'cut' function is now available after 'init' has completed
    const segmentedWords = cut(message.text, true)
    sendResponse({ words: segmentedWords })
    return true // Indicates an asynchronous response
  }
})
