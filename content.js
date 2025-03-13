// State variables
let isShiftPressed = false;
let overlayPanel = null;
let highlightedElement = null;
let lastHighlightedElement = null;
let queryPanel = null;
let highlightedElements = [];
let queryResultCount = 0;
let currentXPath = "";
let currentOptimizedXPath = "";
let copyFeedbackTimeout = null;

// Create overlay panel
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
    const xpathText = document.getElementById("xpath-display").textContent;
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

// Copy text to clipboard with feedback
function copyToClipboard(text, feedbackElement = null) {
  // Extract just the XPath from the text if it contains labels
  let xpathToCopy = text;
  if (text.includes("Full XPath:")) {
    const matches = text.match(/Full XPath:\s*([^\n]+)/);
    if (matches && matches[1]) {
      xpathToCopy = matches[1].trim();
    }
  } else if (text.includes("Optimized XPath:")) {
    const matches = text.match(/Optimized XPath:\s*([^\n]+)/);
    if (matches && matches[1]) {
      xpathToCopy = matches[1].trim();
    }
  }

  navigator.clipboard
    .writeText(xpathToCopy)
    .then(() => {
      if (feedbackElement) {
        const originalText = feedbackElement.textContent;
        feedbackElement.textContent = "Copied!";

        // Clear any existing timeout
        if (copyFeedbackTimeout) {
          clearTimeout(copyFeedbackTimeout);
        }

        copyFeedbackTimeout = setTimeout(() => {
          feedbackElement.textContent = originalText;
          copyFeedbackTimeout = null;
        }, 1500);
      }

      // Also show a floating notification
      showCopyNotification(xpathToCopy);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      if (feedbackElement) {
        const originalText = feedbackElement.textContent;
        feedbackElement.textContent = "Copy failed!";

        if (copyFeedbackTimeout) {
          clearTimeout(copyFeedbackTimeout);
        }

        copyFeedbackTimeout = setTimeout(() => {
          feedbackElement.textContent = originalText;
          copyFeedbackTimeout = null;
        }, 1500);
      }
    });
}

// Show a floating notification when XPath is copied
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
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300); // Wait for fade out animation
  }, 2000);
}

// Generate XPath for an element
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

// Generate a more concise XPath using attributes when available
function getOptimizedXPath(element) {
  if (!element) return "";

  // If element has an id, use it
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  // If element has a unique class, use it
  if (element.className && typeof element.className === "string") {
    const classes = element.className.split(/\s+/).filter((c) => c);
    for (const className of classes) {
      const sameClassElements = document.getElementsByClassName(className);
      if (sameClassElements.length === 1) {
        return `//*[@class="${className}"]`;
      }
    }
  }

  // If element has a name attribute, use it
  if (element.name) {
    const sameNameElements = document.getElementsByName(element.name);
    if (sameNameElements.length === 1) {
      return `//*[@name="${element.name}"]`;
    }
  }

  // If element has a unique text content, use it
  if (element.textContent && element.textContent.trim()) {
    const text = element.textContent.trim();
    if (text.length < 50) {
      // Only use text if it's reasonably short
      const xpathResult = document.evaluate(
        `//${element.nodeName.toLowerCase()}[contains(text(), "${text.replace(
          /"/g,
          '\\"'
        )}")]`,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      if (xpathResult.snapshotLength === 1) {
        return `//${element.nodeName.toLowerCase()}[contains(text(), "${text.replace(
          /"/g,
          '\\"'
        )}")]`;
      }
    }
  }

  // Fall back to the full path
  return getXPath(element);
}

// Update the overlay panel with XPath information
function updateOverlayPanel(element) {
  if (!overlayPanel) {
    overlayPanel = createOverlayPanel();
  }

  if (!element) {
    overlayPanel.style.display = "none";
    currentXPath = "";
    currentOptimizedXPath = "";
    return;
  }

  const xpathDisplay = document.getElementById("xpath-display");
  currentXPath = getXPath(element);
  currentOptimizedXPath = getOptimizedXPath(element);

  xpathDisplay.textContent = `Full XPath:\n${currentXPath}\n\nOptimized XPath:\n${currentOptimizedXPath}`;

  // Position the panel near the element but ensure it's visible
  const rect = element.getBoundingClientRect();
  const panelHeight = overlayPanel.offsetHeight;
  const panelWidth = overlayPanel.offsetWidth;

  let top = rect.bottom + window.scrollY + 10;
  let left = rect.left + window.scrollX;

  // Adjust if panel would go off-screen
  if (top + panelHeight > window.innerHeight + window.scrollY) {
    top = rect.top + window.scrollY - panelHeight - 10;
  }

  if (left + panelWidth > window.innerWidth + window.scrollX) {
    left = window.innerWidth + window.scrollX - panelWidth - 10;
  }

  overlayPanel.style.top = `${top}px`;
  overlayPanel.style.left = `${left}px`;
  overlayPanel.style.display = "block";
}

// Create fixed query panel for manual XPath entry
function createQueryPanel() {
  if (queryPanel) {
    queryPanel.style.display = "block";
    return queryPanel;
  }

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
  input.addEventListener("input", handleXPathInput);
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

  document.body.appendChild(panel);
  return panel;
}

// Make an element draggable
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
    // Set the element's new position
    element.style.top = element.offsetTop - pos2 + "px";
    element.style.left = element.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Handle XPath input changes
function handleXPathInput(event) {
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
    updateResultCount(0, true, error.message);
  }
}

// Evaluate XPath and highlight matching elements
function evaluateXPath(query) {
  clearHighlightedElements();

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

    for (let i = 0; i < matchCount; i++) {
      const element = result.snapshotItem(i);
      if (element && element.nodeType === Node.ELEMENT_NODE) {
        element.classList.add("xpath-query-match");
        highlightedElements.push(element);
      }
    }
  } catch (error) {
    updateResultCount(0, true, error.message);
  }
}

// Update the result count display
function updateResultCount(count, isError = false, errorMessage = "") {
  queryResultCount = count;
  const resultCountElement = document.getElementById("xpath-result-count");

  if (isError) {
    resultCountElement.textContent = `Error: ${errorMessage}`;
    resultCountElement.classList.add("xpath-error");
  } else {
    resultCountElement.textContent =
      count === 0 ? "No matches" : count === 1 ? "1 match" : `${count} matches`;
    resultCountElement.classList.remove("xpath-error");
  }
}

// Clear all highlighted elements
function clearHighlightedElements() {
  highlightedElements.forEach((element) => {
    element.classList.remove("xpath-query-match");
  });
  highlightedElements = [];
}

// Open the query panel
function openQueryPanel() {
  if (!queryPanel) {
    queryPanel = createQueryPanel();
  } else {
    queryPanel.style.display = "block";
  }

  // Focus the input field
  setTimeout(() => {
    const input = document.getElementById("xpath-query-input");
    if (input) {
      input.focus();
    }
  }, 100);
}

// Highlight the element under cursor
function highlightElement(element) {
  if (lastHighlightedElement) {
    lastHighlightedElement.classList.remove("xpath-highlight");
  }

  if (element) {
    element.classList.add("xpath-highlight");
    lastHighlightedElement = element;
  }
}

// Mouse move handler
function handleMouseMove(event) {
  if (!isShiftPressed) {
    if (overlayPanel) {
      overlayPanel.style.display = "none";
    }
    if (lastHighlightedElement) {
      lastHighlightedElement.classList.remove("xpath-highlight");
      lastHighlightedElement = null;
    }
    return;
  }

  // Get the element under the cursor, but ignore our overlay
  const element = document.elementFromPoint(event.clientX, event.clientY);
  if (
    element &&
    !element.closest("#xpath-overlay-panel") &&
    !element.closest(".xpath-copy-notification")
  ) {
    highlightedElement = element;
    highlightElement(element);
    updateOverlayPanel(element);
  }
}

// Key event handlers
function handleKeyDown(event) {
  if (event.key === "Shift") {
    isShiftPressed = true;
  }

  // Handle keyboard shortcuts when shift is pressed
  if (isShiftPressed && highlightedElement) {
    if (event.key === "l" || event.key === "L") {
      // Copy full XPath
      copyToClipboard(currentXPath);
      event.preventDefault();
    } else if (event.key === "o" || event.key === "O") {
      // Copy optimized XPath
      copyToClipboard(currentOptimizedXPath);
      event.preventDefault();
    }
  }
}

function handleKeyUp(event) {
  if (event.key === "Shift") {
    isShiftPressed = false;
    if (overlayPanel) {
      overlayPanel.style.display = "none";
    }
    if (lastHighlightedElement) {
      lastHighlightedElement.classList.remove("xpath-highlight");
      lastHighlightedElement = null;
    }
  }
}

// Initialize the extension
function init() {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openQueryPanel") {
      openQueryPanel();
    }
  });
}

// Start the extension when the page is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
