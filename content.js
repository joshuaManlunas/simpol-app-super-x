/**
 * Super-X XPath Query Generator
 * A Chrome extension for generating and testing XPath queries for web elements.
 * Written by: @joshuaManlunas
 * Version: 1.0.0
 * Date: 2025-03-13
 */

// Types
/**
 * @typedef {Object} State
 * @property {boolean} isShiftPressed - Whether the shift key is currently pressed
 * @property {HTMLElement|null} highlightedElement - The currently highlighted element under cursor
 * @property {HTMLElement|null} lastHighlightedElement - The previously highlighted element
 * @property {string} currentXPath - The current full XPath
 * @property {string} currentOptimizedXPath - The current optimized XPath
 * @property {number} queryResultCount - Number of elements matching the current query
 * @property {HTMLElement[]} highlightedElements - Elements highlighted by manual XPath query
 * @property {number|null} copyFeedbackTimeout - Timeout ID for copy feedback message
 * @property {boolean} isEnabled - Whether the extension is currently enabled
 */

// State management
const state = {
  isShiftPressed: false,
  highlightedElement: null,
  lastHighlightedElement: null,
  overlayPanel: null,
  queryPanel: null,
  highlightedElements: [],
  queryResultCount: 0,
  isEnabled: true, // Default to enabled
  currentXPath: "",
  currentOptimizedXPath: "",
  copyFeedbackTimeout: null,
};

/**
 * Creates the overlay panel for displaying XPath information
 * @returns {HTMLElement} The created overlay panel
 */
function createOverlayPanel() {
  const panel = document.createElement("div");
  panel.id = "xpath-overlay-panel";
  panel.classList.add("xpath-overlay-panel");
  panel.style.display = "none";

  const header = document.createElement("div");
  header.classList.add("xpath-overlay-header");
  header.textContent = "XPath Query";

  const content = document.createElement("div");
  content.classList.add("xpath-overlay-content");

  const xpathDisplay = document.createElement("pre");
  xpathDisplay.id = "xpath-display";
  xpathDisplay.classList.add("xpath-display");
  content.appendChild(xpathDisplay);

  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy";
  copyButton.id = "xpath-copy-button";
  copyButton.classList.add("xpath-copy-button");
  copyButton.addEventListener("click", () => {
    const xpathText =
      document.getElementById("xpath-display")?.textContent || "";
    copyToClipboard(xpathText, copyButton);
  });

  const shortcutInfo = document.createElement("div");
  shortcutInfo.classList.add("xpath-shortcut-info");
  shortcutInfo.innerHTML =
    "Shortcuts: <kbd>Shift+L</kbd> Copy full XPath | <kbd>Shift+O</kbd> Copy optimized XPath";

  panel.appendChild(header);
  panel.appendChild(content);
  panel.appendChild(copyButton);
  panel.appendChild(shortcutInfo);

  document.body.appendChild(panel);
  return panel;
}

/**
 * Copies text to clipboard and shows feedback
 * @param {string} text - Text to copy
 * @param {HTMLElement|null} feedbackElement - Element to show feedback on
 */
function copyToClipboard(text, feedbackElement = null) {
  // Extract just the XPath from the text if it contains labels
  let xpathToCopy = text;
  const fullXPathMatch = text.match(/Full XPath:\s*([^\n]+)/);
  const optimizedXPathMatch = text.match(/Optimized XPath:\s*([^\n]+)/);

  if (fullXPathMatch && fullXPathMatch[1]) {
    xpathToCopy = fullXPathMatch[1].trim();
  } else if (optimizedXPathMatch && optimizedXPathMatch[1]) {
    xpathToCopy = optimizedXPathMatch[1].trim();
  }

  navigator.clipboard
    .writeText(xpathToCopy)
    .then(() => {
      if (feedbackElement) {
        const originalText = feedbackElement.textContent || "";
        feedbackElement.textContent = "Copied!";

        // Clear any existing timeout
        if (state.copyFeedbackTimeout) {
          clearTimeout(state.copyFeedbackTimeout);
        }

        state.copyFeedbackTimeout = setTimeout(() => {
          feedbackElement.textContent = originalText;
          state.copyFeedbackTimeout = null;
        }, 1500);
      }

      // Also show a floating notification
      showCopyNotification(xpathToCopy);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      if (feedbackElement) {
        const originalText = feedbackElement.textContent || "";
        feedbackElement.textContent = "Copy failed!";

        if (state.copyFeedbackTimeout) {
          clearTimeout(state.copyFeedbackTimeout);
        }

        state.copyFeedbackTimeout = setTimeout(() => {
          feedbackElement.textContent = originalText;
          state.copyFeedbackTimeout = null;
        }, 1500);
      }
    });
}

/**
 * Shows a floating notification when XPath is copied
 * @param {string} xpath - The copied XPath
 */
function showCopyNotification(xpath) {
  const notification = document.createElement("div");
  notification.classList.add("xpath-copy-notification");

  const message = document.createElement("div");
  message.textContent = "XPath copied to clipboard!";

  const xpathPreview = document.createElement("div");
  xpathPreview.classList.add("xpath-preview");
  xpathPreview.textContent =
    xpath.length > 50 ? xpath.substring(0, 47) + "..." : xpath;

  notification.appendChild(message);
  notification.appendChild(xpathPreview);

  document.body.appendChild(notification);

  // Animate in
  requestAnimationFrame(() => {
    notification.classList.add("show");
  });

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.parentNode?.removeChild(notification);
    }, 300); // Wait for fade out animation
  }, 2000);
}

/**
 * Generates a full XPath for an element
 * @param {Element|null} element - Element to generate XPath for
 * @returns {string} The XPath
 */
function getXPath(element) {
  if (!element) return "";

  // If element has an id, use it for a shorter XPath
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  // Generate a full path
  const paths = [];

  // Use nodeName for element (converting to lowercase for HTML, keeping case for XML)
  for (
    ;
    element && element.nodeType === Node.ELEMENT_NODE;
    element = element.parentNode
  ) {
    let index = 0;
    let hasFollowingSiblings = false;

    for (
      let sibling = element.previousSibling;
      sibling;
      sibling = sibling.previousSibling
    ) {
      if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) continue;

      if (sibling.nodeName === element.nodeName) {
        ++index;
      }
    }

    for (
      let sibling = element.nextSibling;
      sibling && !hasFollowingSiblings;
      sibling = sibling.nextSibling
    ) {
      if (sibling.nodeName === element.nodeName) {
        hasFollowingSiblings = true;
      }
    }

    const tagName = element.nodeName.toLowerCase();
    const pathIndex = index || hasFollowingSiblings ? `[${index + 1}]` : "";
    paths.unshift(tagName + pathIndex);
  }

  return "/" + paths.join("/");
}

/**
 * Generates a more concise XPath using attributes when available
 * @param {Element|null} element - Element to generate optimized XPath for
 * @returns {string} The optimized XPath
 */
function getOptimizedXPath(element) {
  if (!element) return "";

  // If element has an id, use it
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  // Define classes added by the extension that should be ignored
  const extensionClasses = ["xpath-highlight", "xpath-query-match"];

  // If element has a unique class, use it (excluding extension-added classes)
  if (element.className && typeof element.className === "string") {
    const classes = element.className
      .split(/\s+/)
      .filter(Boolean)
      .filter((className) => !extensionClasses.includes(className));

    // Try each individual class that is not from our extension
    for (const className of classes) {
      const sameClassElements = document.getElementsByClassName(className);
      if (sameClassElements.length === 1) {
        return `//*[@class="${className}"]`;
      }
    }
  }

  // Try with combined classes if there are multiple (excluding extension-added classes)
  if (element.className && typeof element.className === "string") {
    // Remove extension classes before creating the combined class query
    const filteredClassNames = element.className
      .split(/\s+/)
      .filter(Boolean)
      .filter((className) => !extensionClasses.includes(className))
      .join(" ");

    if (filteredClassNames) {
      const sameClassElements = document.querySelectorAll(
        `.${CSS.escape(filteredClassNames)}`
      );
      if (sameClassElements.length === 1) {
        return `//*[@class="${filteredClassNames}"]`;
      }
    }
  }

  // If element has a name attribute, use it
  if (element.hasAttribute("name")) {
    const name = element.getAttribute("name");
    const sameNameElements = document.getElementsByName(name || "");
    if (sameNameElements.length === 1) {
      return `//*[@name="${name}"]`;
    }
  }

  // If element has a unique text content, try to use it
  if (element.textContent) {
    const text = element.textContent.trim();
    if (text.length > 0 && text.length < 50) {
      // Only use text if it's reasonably short
      try {
        const escapedText = text.replace(/"/g, '\\"');
        const xpathQuery = `//${element.nodeName.toLowerCase()}[contains(text(), "${escapedText}")]`;
        const xpathResult = document.evaluate(
          xpathQuery,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        if (xpathResult.snapshotLength === 1) {
          return xpathQuery;
        }
      } catch (e) {
        // If there's an error in the XPath evaluation, fall back to full path
        console.debug("Error generating optimized XPath:", e);
      }
    }
  }

  // If element has a unique attribute combination, try using that
  const uniqueAttributes = ["type", "role", "aria-label", "data-testid"];
  for (const attr of uniqueAttributes) {
    if (element.hasAttribute(attr)) {
      const value = element.getAttribute(attr);
      try {
        const query = `//${element.nodeName.toLowerCase()}[@${attr}="${value}"]`;
        const result = document.evaluate(
          query,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        if (result.snapshotLength === 1) {
          return query;
        }
      } catch (e) {
        // Skip this attribute if there's an error
        console.debug(`Error with attribute ${attr}:`, e);
      }
    }
  }

  // Fall back to the full path
  return getXPath(element);
}

/**
 * Updates the overlay panel with XPath information
 * @param {Element|null} element - Element to show XPath for
 */
function updateOverlayPanel(element) {
  if (!state.overlayPanel) {
    state.overlayPanel = createOverlayPanel();
  }

  if (!element) {
    state.overlayPanel.style.display = "none";
    state.currentXPath = "";
    state.currentOptimizedXPath = "";
    return;
  }

  const xpathDisplay = document.getElementById("xpath-display");
  if (!xpathDisplay) return;

  state.currentXPath = getXPath(element);
  state.currentOptimizedXPath = getOptimizedXPath(element);

  xpathDisplay.textContent = `Full XPath:\n${state.currentXPath}\n\nOptimized XPath:\n${state.currentOptimizedXPath}`;

  // Position the panel near the element but ensure it's visible
  const rect = element.getBoundingClientRect();
  const panelHeight = state.overlayPanel.offsetHeight;
  const panelWidth = state.overlayPanel.offsetWidth;

  let top = rect.bottom + window.scrollY + 10;
  let left = rect.left + window.scrollX;

  // Adjust if panel would go off-screen
  if (top + panelHeight > window.innerHeight + window.scrollY) {
    top = rect.top + window.scrollY - panelHeight - 10;
  }

  if (left + panelWidth > window.innerWidth + window.scrollX) {
    left = window.innerWidth + window.scrollX - panelWidth - 10;
  }

  state.overlayPanel.style.top = `${top}px`;
  state.overlayPanel.style.left = `${left}px`;
  state.overlayPanel.style.display = "block";
}

/**
 * Creates fixed query panel for manual XPath entry
 * @returns {HTMLElement} The created query panel
 */
function createQueryPanel() {
  // Create a new panel regardless of state
  const panel = document.createElement("div");
  panel.id = "xpath-query-panel";
  panel.classList.add("xpath-query-panel");

  const header = document.createElement("div");
  header.classList.add("xpath-panel-header");

  const title = document.createElement("span");
  title.textContent = "XPath Query Tester";
  header.appendChild(title);

  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.setAttribute("aria-label", "Close panel");
  closeButton.classList.add("xpath-panel-close");
  closeButton.addEventListener("click", () => {
    panel.style.display = "none";
    clearHighlightedElements();
  });
  header.appendChild(closeButton);

  const content = document.createElement("div");
  content.classList.add("xpath-panel-content");

  const inputContainer = document.createElement("div");
  inputContainer.classList.add("xpath-input-container");

  const input = document.createElement("input");
  input.type = "text";
  input.id = "xpath-query-input";
  input.classList.add("xpath-query-input");
  input.placeholder = "Enter XPath query...";
  input.addEventListener("input", debounce(handleXPathInput, 300)); // Debounce for better performance
  inputContainer.appendChild(input);

  const resultCount = document.createElement("div");
  resultCount.id = "xpath-result-count";
  resultCount.classList.add("xpath-result-count");
  resultCount.textContent = "No matches";

  content.appendChild(inputContainer);
  content.appendChild(resultCount);

  panel.appendChild(header);
  panel.appendChild(content);

  // Add resize handle
  const resizeHandle = document.createElement("div");
  resizeHandle.classList.add("xpath-resize-handle");
  panel.appendChild(resizeHandle);

  // Make panel draggable
  makeDraggable(panel, header);

  // Set initial position in the viewport
  panel.style.top = "100px";
  panel.style.left = "100px";
  panel.style.display = "block";

  document.body.appendChild(panel);
  return panel;
}

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Time to wait in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Makes an element draggable
 * @param {HTMLElement} element - Element to make draggable
 * @param {HTMLElement} handle - Handle element for dragging
 */
function makeDraggable(element, handle) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  handle.style.cursor = "move";
  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Set the element's new position, making sure it stays on screen
    const newTop = Math.max(0, element.offsetTop - pos2);
    const newLeft = Math.max(0, element.offsetLeft - pos1);

    // Prevent moving too far right or bottom
    const maxLeft = window.innerWidth - element.offsetWidth;
    const maxTop = window.innerHeight - element.offsetHeight / 2;

    element.style.top = Math.min(newTop, maxTop) + "px";
    element.style.left = Math.min(newLeft, maxLeft) + "px";
  }

  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

/**
 * Handles XPath input changes
 * @param {Event} event - Input event
 */
function handleXPathInput(event) {
  if (!event.target) return;

  const query = event.target.value.trim();
  if (!query) {
    clearHighlightedElements();
    updateResultCount(0);
    return;
  }

  try {
    evaluateXPath(query);
  } catch (error) {
    clearHighlightedElements();
    updateResultCount(
      0,
      true,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Ensures XPath highlight styles are in the document
 */
function ensureHighlightStyles() {
  if (!document.getElementById("xpath-highlight-styles")) {
    const styleEl = document.createElement("style");
    styleEl.id = "xpath-highlight-styles";
    styleEl.textContent = `
      .xpath-query-match {
        outline: 2px solid #4285f4 !important;
        outline-offset: 2px !important;
        background-color: rgba(66, 133, 244, 0.2) !important;
        animation: xpath-pulse 2s infinite !important;
      }

      @keyframes xpath-pulse {
        0% { outline-offset: 2px; }
        50% { outline-offset: 4px; }
        100% { outline-offset: 2px; }
      }

      .xpath-highlight {
        outline: 2px solid #ff5722 !important;
        outline-offset: 2px !important;
        background-color: rgba(255, 87, 34, 0.1) !important;
        transition: outline-color 0.15s ease !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

/**
 * Evaluates XPath and highlights matching elements
 * @param {string} query - XPath query
 */
function evaluateXPath(query) {
  clearHighlightedElements();
  ensureHighlightStyles(); // Make sure styles are injected

  try {
    const result = document.evaluate(
      query,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    const matchCount = result.snapshotLength;
    updateResultCount(matchCount);

    // Don't highlight too many elements to maintain performance
    const maxHighlight = 100;
    const limitedCount = Math.min(matchCount, maxHighlight);

    for (let i = 0; i < limitedCount; i++) {
      const element = result.snapshotItem(i);
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        element.classList.add("xpath-query-match");
        state.highlightedElements.push(element);
      }
    }

    if (matchCount > maxHighlight) {
      updateResultCount(
        matchCount,
        false,
        `Showing first ${maxHighlight} of ${matchCount} matches`
      );
    }
  } catch (error) {
    updateResultCount(
      0,
      true,
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Updates the result count display
 * @param {number} count - Match count
 * @param {boolean} isError - Whether there's an error
 * @param {string} errorMessage - Error message
 */
function updateResultCount(count, isError = false, errorMessage = "") {
  state.queryResultCount = count;
  const resultCountElement = document.getElementById("xpath-result-count");
  if (!resultCountElement) return;

  if (isError) {
    resultCountElement.textContent = `Error: ${errorMessage}`;
    resultCountElement.classList.add("xpath-error");
  } else if (errorMessage) {
    resultCountElement.textContent = errorMessage;
    resultCountElement.classList.remove("xpath-error");
  } else {
    resultCountElement.textContent =
      count === 0 ? "No matches" : count === 1 ? "1 match" : `${count} matches`;
    resultCountElement.classList.remove("xpath-error");
  }
}

/**
 * Clears all highlighted elements
 */
function clearHighlightedElements() {
  state.highlightedElements.forEach((element) => {
    element.classList.remove("xpath-query-match");
  });
  state.highlightedElements = [];
}

/**
 * Opens the query panel
 */
function openQueryPanel() {
  // Skip if extension is disabled
  if (!state.isEnabled) return;

  console.log("Opening query panel");

  // Remove any existing panel completely
  const existingPanel = document.getElementById("xpath-query-panel");
  if (existingPanel) {
    existingPanel.remove();
  }

  // Always set to null first to ensure clean state
  state.queryPanel = null;

  // Create a brand new panel
  state.queryPanel = createQueryPanel();

  // Focus the input field
  setTimeout(() => {
    const input = document.getElementById("xpath-query-input");
    if (input) {
      input.focus();
    }
  }, 100);

  console.log("Query panel opened:", state.queryPanel);
}

/**
 * Highlights the element under cursor
 * @param {Element|null} element - Element to highlight
 */
function highlightElement(element) {
  ensureHighlightStyles(); // Make sure styles are injected

  if (state.lastHighlightedElement) {
    state.lastHighlightedElement.classList.remove("xpath-highlight");
  }

  if (element) {
    element.classList.add("xpath-highlight");
    state.lastHighlightedElement = element;
  }
}

/**
 * Mouse move handler
 * @param {MouseEvent} event - Mouse event
 */
function handleMouseMove(event) {
  // Skip if extension is disabled or shift key isn't pressed
  if (!state.isEnabled || !state.isShiftPressed) return;

  if (state.overlayPanel) {
    state.overlayPanel.style.display = "none";
  }
  if (state.lastHighlightedElement) {
    state.lastHighlightedElement.classList.remove("xpath-highlight");
    state.lastHighlightedElement = null;
  }

  // Get the element under the cursor, but ignore our overlay
  const element = document.elementFromPoint(event.clientX, event.clientY);
  if (
    element &&
    !element.closest("#xpath-overlay-panel") &&
    !element.closest(".xpath-copy-notification")
  ) {
    state.highlightedElement = element;
    highlightElement(element);
    updateOverlayPanel(element);
  }
}

/**
 * Key down event handler
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyDown(event) {
  // Skip if extension is disabled
  if (!state.isEnabled) return;

  if (event.key === "Shift") {
    state.isShiftPressed = true;
  }

  // Handle keyboard shortcuts when shift is pressed
  if (state.isShiftPressed && state.highlightedElement) {
    if (event.key === "l" || event.key === "L") {
      // Copy full XPath
      copyToClipboard(state.currentXPath);
      event.preventDefault();
    } else if (event.key === "o" || event.key === "O") {
      // Copy optimized XPath
      copyToClipboard(state.currentOptimizedXPath);
      event.preventDefault();
    }
  }
}

/**
 * Key up event handler
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyUp(event) {
  if (event.key === "Shift") {
    state.isShiftPressed = false;
    if (state.overlayPanel) {
      state.overlayPanel.style.display = "none";
    }
    if (state.lastHighlightedElement) {
      state.lastHighlightedElement.classList.remove("xpath-highlight");
      state.lastHighlightedElement = null;
    }
  }
}

/**
 * Initialize the extension
 */
function init() {
  // Add state object to store extension state
  window.xpathGeneratorState = state;

  // Ensure highlight styles are injected right at the beginning
  ensureHighlightStyles();

  // Load enabled state from storage
  chrome.storage.sync.get("isEnabled", (result) => {
    state.isEnabled = result.isEnabled === undefined ? true : result.isEnabled;
    console.log(
      `Super-X XPath Query Generator ${
        state.isEnabled ? "enabled" : "disabled"
      }`
    );
  });

  // We use passive: true for better performance when possible
  document.addEventListener("mousemove", handleMouseMove, { passive: true });
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Add message listener for popup communications
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);

    if (message.action === "openQueryPanel") {
      try {
        console.log("Opening XPath query panel");
        openQueryPanel();
        sendResponse({ success: true });
      } catch (error) {
        console.error("Error opening query panel:", error);
        sendResponse({ success: false, error: error.message });
      }
    } else if (message.action === "toggleExtension") {
      state.isEnabled = message.isEnabled;

      // Clear any existing highlights when disabling
      if (!state.isEnabled) {
        clearHighlights();

        // Close any open panels
        if (state.overlayPanel) {
          state.overlayPanel.style.display = "none";
        }

        // Remove panel completely when disabling
        const existingPanel = document.getElementById("xpath-query-panel");
        if (existingPanel) {
          existingPanel.remove();
          state.queryPanel = null;
        }
      }

      console.log(
        `Super-X XPath Query Generator ${
          state.isEnabled ? "enabled" : "disabled"
        }`
      );
      sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async responses
  });

  console.log("Super-X XPath Query Generator initialized 🚀");
}

/**
 * Clear all highlighted elements
 */
function clearHighlights() {
  // Remove highlights from manual query
  if (state.highlightedElements.length > 0) {
    state.highlightedElements.forEach((el) => {
      el.classList.remove("xpath-query-match");
    });
    state.highlightedElements = [];
  }

  // Remove highlight from current hover element
  if (state.lastHighlightedElement) {
    state.lastHighlightedElement.classList.remove("xpath-highlight");
    state.lastHighlightedElement = null;
  }
}

// Initialize the extension
init();
