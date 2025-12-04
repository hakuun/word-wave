/**
 * Monitors elements that are the STRICT, DIRECT source of text content.
 * It ensures that only elements possessing text nodes as immediate children
 * are tracked, excluding parents that hold text only via their children.
 */
export class TextMonitor {
  // ----------------------------------------------------------------------
  // PRIVATE PROPERTIES
  // ----------------------------------------------------------------------

  private visibleElementsSet: Set<HTMLElement> = new Set<HTMLElement>()
  private observer: IntersectionObserver | null = null
  private mutationObserver: MutationObserver | null = null
  private isMonitoring: boolean = false
  private initialCandidates: NodeListOf<HTMLElement>
  private updateCallback: (visibleElements: HTMLElement[]) => void

  // Use a broad selector for comprehensive checking, but filter strictly later
  private static readonly broadSelector: string =
    "p, h1, h2, h3, h4, h5, h6, li, span, a, button, blockquote, figcaption, td, th, " +
    "div, section, article, header, footer, main, body"

  // ----------------------------------------------------------------------
  // CONSTRUCTOR & UTILITY
  // ----------------------------------------------------------------------

  /**
   * Initializes the TextMonitor with a callback to handle visible elements.
   */
  constructor(updateCallback: (visibleElements: HTMLElement[]) => void) {
    this.updateCallback = updateCallback
    this.initialCandidates = document.querySelectorAll<HTMLElement>(
      TextMonitor.broadSelector
    )
  }

  /**
   * Checks if an element has non-whitespace text as a direct child node.
   * This is the ONLY source of truth for direct text containment.
   */
  private hasDirectTextContent(element: HTMLElement): boolean {
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i]

      // Check if the node is a Text Node (nodeType 3)
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim().length > 0) {
          return true
        }
      }
    }
    return false
  }

  /**
   * Determines if an element is a DIRECT source of text content.
   * This is now strictly equal to checking for direct text content.
   */
  private isDirectTextContainer(element: HTMLElement): boolean {
    // The only condition is having a text node as a direct child.
    return this.hasDirectTextContent(element)
  }

  // ----------------------------------------------------------------------
  // OBSERVER HANDLERS
  // ----------------------------------------------------------------------

  /**
   * Handles element intersection events (scrolling visibility change).
   */
  private handleIntersection = (entries: IntersectionObserverEntry[]): void => {
    let listChanged = false

    entries.forEach((entry: IntersectionObserverEntry) => {
      const element = entry.target as HTMLElement

      // 1. CRITICAL: Only proceed if the element is a STRICT direct text container.
      if (!this.isDirectTextContainer(element)) {
        // If it doesn't contain text directly, we stop observing it forever.
        this.observer?.unobserve(element)
        return
      }

      // 2. Update the Set based on intersection status
      if (entry.isIntersecting) {
        if (!this.visibleElementsSet.has(element)) {
          this.visibleElementsSet.add(element)
          listChanged = true
        }
      } else {
        if (this.visibleElementsSet.has(element)) {
          this.visibleElementsSet.delete(element)
          listChanged = true
        }
      }
    })

    // 3. Call the external callback if the visible list changed
    if (listChanged) {
      this.updateCallback(Array.from(this.visibleElementsSet))
    }
  }

  /**
   * Handles DOM mutation events (element added/removed).
   */
  private handleMutations = (mutations: MutationRecord[]): void => {
    let listChanged = false

    mutations.forEach((mutation) => {
      // A. Handle Added Nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement

          // Check element itself
          if (element.matches(TextMonitor.broadSelector)) {
            this.observer?.observe(element)
          }

          // Check children
          element
            .querySelectorAll<HTMLElement>(TextMonitor.broadSelector)
            .forEach((child) => this.observer?.observe(child))
        }
      })

      // B. Handle Removed Nodes
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement

          // Clean up and check for removal from the visible set
          if (this.observer) {
            this.observer.unobserve(element)
            if (this.visibleElementsSet.delete(element)) {
              listChanged = true
            }
          }

          // Clean up children
          element
            .querySelectorAll<HTMLElement>(TextMonitor.broadSelector)
            .forEach((child) => this.observer?.unobserve(child))
        }
      })
    })

    // Only call the external callback if the visible list changed
    if (listChanged) {
      this.updateCallback(Array.from(this.visibleElementsSet))
    }
  }

  // ----------------------------------------------------------------------
  // PUBLIC CONTROL METHODS
  // ----------------------------------------------------------------------

  /**
   * 🟢 Starts the real-time visibility monitoring process.
   */
  public start(): void {
    if (this.isMonitoring) return

    // 1. Setup Intersection Observer
    if (!this.observer) {
      this.observer = new IntersectionObserver(this.handleIntersection, {
        root: null, // Viewport
        rootMargin: "0px",
        threshold: 0.001
      })
    }

    // Start observing all initial candidates
    this.initialCandidates.forEach((element) => {
      this.observer!.observe(element)
    })

    // 2. Setup Mutation Observer for dynamic DOM changes
    if (!this.mutationObserver) {
      this.mutationObserver = new MutationObserver(this.handleMutations)
      const observerConfig: MutationObserverInit = {
        childList: true,
        subtree: true
      }
      this.mutationObserver.observe(document.body, observerConfig)
    }

    this.isMonitoring = true
    console.log(
      `Strict Direct Text Monitoring started. Observing ${this.initialCandidates.length} potential elements.`
    )
  }

  /**
   * ⏸️ Stops the real-time visibility monitoring process.
   */
  public pause(): void {
    if (!this.isMonitoring) return

    this.observer?.disconnect()
    this.mutationObserver?.disconnect()

    this.isMonitoring = false
    console.log("Strict Direct Text Monitoring paused.")
  }

  /**
   * Clears the internal state, removing references to elements from the previous view.
   * This should be called externally upon every major view/route switch.
   */
  public reset(): void {
    // 1. Clear the visible set (the most important step)
    this.visibleElementsSet.clear()

    // 2. Restart the Intersection Observer (disconnects all old observations)
    this.observer?.disconnect()

    // 3. Re-initialize the Intersection Observer and re-observe current elements
    // This is necessary because `disconnect()` clears all targets.
    if (this.observer) {
      this.initialCandidates.forEach((element) => {
        this.observer!.observe(element)
      })
    }

    console.log("Direct Text Monitor state reset successful.")

    // Notify the external callback that the list is now empty
    this.updateCallback(this.getVisibleElements())
  }

  // ----------------------------------------------------------------------
  // PUBLIC DATA RETRIEVAL METHODS
  // ----------------------------------------------------------------------

  /**
   * Retrieves the current snapshot of all visible elements that DIRECTLY contain text.
   * @returns {HTMLElement[]} An array of the currently visible elements.
   */
  public getVisibleElements(): HTMLElement[] {
    return Array.from(this.visibleElementsSet)
  }

  /**
   * Retrieves the number of currently visible direct text elements.
   * @returns {number} The count of visible elements.
   */
  public getVisibleCount(): number {
    return this.visibleElementsSet.size
  }
}
