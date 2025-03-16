/**
 * Super-X XPath Query Generator
 * A Chrome extension for generating and testing XPath queries for web elements.
 * Written by: @joshuaManlunas
 * Version: 1.0.0
 * Date: 2023-03-13
 */

// Import styles to ensure they're included in the build
import './styles.css';

// Chrome API is available globally in extensions
/// <reference types="chrome" />

// Use ES module syntax to isolate scope
export { }; // This makes the file a module with its own scope

// Add this at the top of the file to define the chrome namespace
declare const chrome: any;

// Types
interface State {
    isShiftPressed: boolean;
    highlightedElement: HTMLElement | null;
    lastHighlightedElement: HTMLElement | null;
    overlayPanel: HTMLElement | null;
    queryPanel: HTMLElement | null;
    highlightedElements: HTMLElement[];
    queryResultCount: number;
    currentXPath: string;
    currentOptimizedXPath: string;
    copyFeedbackTimeout: number | null;
}

// State management
const state: State = {
    isShiftPressed: false,
    highlightedElement: null,
    lastHighlightedElement: null,
    overlayPanel: null,
    queryPanel: null,
    highlightedElements: [],
    queryResultCount: 0,
    currentXPath: "",
    currentOptimizedXPath: "",
    copyFeedbackTimeout: null,
};

/**
 * Creates the overlay panel for displaying XPath information
 * @returns The created overlay panel
 */
function createOverlayPanel(): HTMLElement {
    const panel = document.createElement("div");
    panel.id = "xpath-overlay-panel";
    panel.classList.add("xpath-overlay-panel");
    panel.style.display = "none";

    const header = document.createElement("div");
    header.classList.add("xpath-overlay-header");
    header.textContent = "XPath Query";

    const content = document.createElement("div");
    content.classList.add("xpath-overlay-content");

    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);

    return panel;
}

/**
 * Gets the XPath for an element
 * @param element The element to get the XPath for
 * @returns The XPath string
 */
function getXPath(element: HTMLElement): string {
    // Stub implementation
    return `//*[@id="${element.id}"]`;
}

/**
 * Gets an optimized XPath for an element
 * @param element The element to get the optimized XPath for
 * @returns The optimized XPath string
 */
function getOptimizedXPath(element: HTMLElement): string {
    // Stub implementation
    if (element.id) {
        return `//*[@id="${element.id}"]`;
    }
    return "//element";
}

/**
 * Handler for mouse movement
 * @param event Mouse event
 */
function handleMouseMove(event: MouseEvent): void {
    if (!state.isShiftPressed) return;

    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
    if (element && element !== state.highlightedElement) {
        state.highlightedElement = element;
        // Update XPath info
    }
}

/**
 * Handler for key down events
 * @param event Keyboard event
 */
function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
        state.isShiftPressed = true;
    }
}

/**
 * Handler for key up events
 * @param event Keyboard event
 */
function handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
        state.isShiftPressed = false;
    }
}

/**
 * Creates the query panel for testing XPath expressions
 * @returns The created query panel
 */
function createQueryPanel(): HTMLElement {
    // Remove any existing panel
    const existingPanel = document.getElementById("xpath-query-panel");
    if (existingPanel) {
        existingPanel.remove();
    }

    // Create stylesheet for utility classes
    if (!document.getElementById('xpath-panel-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'xpath-panel-styles';
        styleElement.textContent = `
            .xpath-fixed { position: fixed; }
            .xpath-top-14 { top: 3.5rem; }
            .xpath-right-5 { right: 1.25rem; }
            .xpath-w-80 { width: 20rem; }
            .xpath-bg-white { background-color: white; }
            .xpath-shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); }
            .xpath-rounded-lg { border-radius: 0.5rem; }
            .xpath-z-50 { z-index: 9999; }
            .xpath-p-4 { padding: 1rem; }
            .xpath-font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            .xpath-flex { display: flex; }
            .xpath-justify-between { justify-content: space-between; }
            .xpath-items-center { align-items: center; }
            .xpath-mb-3 { margin-bottom: 0.75rem; }
            .xpath-text-lg { font-size: 1.125rem; }
            .xpath-font-semibold { font-weight: 600; }
            .xpath-m-0 { margin: 0; }
            .xpath-text-blue-600 { color: #4285f4; }
            .xpath-bg-transparent { background-color: transparent; }
            .xpath-border-none { border: none; }
            .xpath-text-xl { font-size: 1.5rem; }
            .xpath-cursor-pointer { cursor: pointer; }
            .xpath-text-gray-500 { color: #6b7280; }
            .xpath-mb-2 { margin-bottom: 0.5rem; }
            .xpath-block { display: block; }
            .xpath-text-sm { font-size: 0.875rem; }
            .xpath-w-full { width: 100%; }
            .xpath-p-2 { padding: 0.5rem; }
            .xpath-box-border { box-sizing: border-box; }
            .xpath-border { border: 1px solid #e5e7eb; }
            .xpath-rounded { border-radius: 0.25rem; }
            .xpath-gap-2 { gap: 0.5rem; }
            .xpath-bg-blue-500 { background-color: #4285f4; }
            .xpath-border-blue-600 { border: 1px solid #3367d6; }
            .xpath-text-white { color: white; }
            .xpath-py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .xpath-px-4 { padding-left: 1rem; padding-right: 1rem; }
            .xpath-bg-gray-100 { background-color: #f3f4f6; }
            .xpath-border-gray-300 { border: 1px solid #d1d5db; }
            .xpath-text-gray-700 { color: #374151; }
            .xpath-mt-3 { margin-top: 0.75rem; }
            .xpath-font-bold { font-weight: 700; }
            .xpath-cursor-move { cursor: move; }
            .xpath-transition { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
            .xpath-hover-bg-blue-600:hover { background-color: #3367d6; }
            .xpath-hover-bg-gray-200:hover { background-color: #e5e7eb; }
        `;
        document.head.appendChild(styleElement);
    }

    // Create the main panel
    const panel = document.createElement("div");
    panel.id = "xpath-query-panel";
    panel.className = "xpath-fixed xpath-top-14 xpath-right-5 xpath-w-80 xpath-bg-white xpath-shadow-lg xpath-rounded-lg xpath-z-50 xpath-p-4 xpath-font-sans";

    // Create header
    const header = document.createElement("div");
    header.className = "xpath-flex xpath-justify-between xpath-items-center xpath-mb-3";

    const title = document.createElement("h3");
    title.textContent = "XPath Query Panel";
    title.className = "xpath-text-lg xpath-font-semibold xpath-m-0 xpath-text-blue-600";

    const closeButton = document.createElement("button");
    closeButton.textContent = "×";
    closeButton.className = "xpath-bg-transparent xpath-border-none xpath-text-xl xpath-cursor-pointer xpath-text-gray-500";
    closeButton.onclick = () => {
        panel.style.display = "none";
    };

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create input area
    const inputContainer = document.createElement("div");
    inputContainer.className = "xpath-mb-2";

    const label = document.createElement("label");
    label.textContent = "Enter XPath:";
    label.className = "xpath-block xpath-text-sm xpath-mb-2";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "//div[@id='example']";
    input.className = "xpath-w-full xpath-p-2 xpath-box-border xpath-border xpath-rounded";

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);

    // Create buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "xpath-flex xpath-gap-2 xpath-mb-3";

    const evaluateButton = document.createElement("button");
    evaluateButton.textContent = "Evaluate";
    evaluateButton.className = "xpath-bg-blue-500 xpath-border-blue-600 xpath-text-white xpath-py-2 xpath-px-4 xpath-rounded xpath-cursor-pointer xpath-transition xpath-hover-bg-blue-600";
    evaluateButton.onclick = () => {
        evaluateXPath(input.value);
    };

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy";
    copyButton.className = "xpath-bg-gray-100 xpath-border-gray-300 xpath-text-gray-700 xpath-py-2 xpath-px-4 xpath-rounded xpath-cursor-pointer xpath-transition xpath-hover-bg-gray-200";
    copyButton.onclick = () => {
        copyToClipboard(input.value);
    };

    buttonsContainer.appendChild(evaluateButton);
    buttonsContainer.appendChild(copyButton);

    // Create results area
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "xpath-mt-3";

    const resultsLabel = document.createElement("div");
    resultsLabel.textContent = "Results:";
    resultsLabel.className = "xpath-text-sm xpath-mb-2";

    const resultsCount = document.createElement("div");
    resultsCount.id = "xpath-results-count";
    resultsCount.textContent = "No elements found";
    resultsCount.className = "xpath-text-sm xpath-font-bold xpath-text-blue-600 xpath-mb-2";

    resultsContainer.appendChild(resultsLabel);
    resultsContainer.appendChild(resultsCount);

    // Make panel draggable
    panel.setAttribute("draggable", "true");
    panel.className += " xpath-cursor-move";

    panel.addEventListener("dragstart", (e) => {
        const rect = panel.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        panel.dataset.offsetX = offsetX.toString();
        panel.dataset.offsetY = offsetY.toString();

        // Set dragging attribute
        panel.setAttribute("dragging", "true");
    });

    document.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    document.addEventListener("drop", (e) => {
        if (panel.getAttribute("dragging") === "true") {
            e.preventDefault();

            const offsetX = parseInt(panel.dataset.offsetX || "0");
            const offsetY = parseInt(panel.dataset.offsetY || "0");

            panel.style.left = `${e.clientX - offsetX}px`;
            panel.style.top = `${e.clientY - offsetY}px`;
            panel.style.right = "auto";

            panel.setAttribute("dragging", "false");
        }
    });

    // Assemble the panel
    panel.appendChild(header);
    panel.appendChild(inputContainer);
    panel.appendChild(buttonsContainer);
    panel.appendChild(resultsContainer);

    // Add to document
    document.body.appendChild(panel);

    return panel;
}

/**
 * Opens the query panel for manual XPath testing
 */
function openQueryPanel(): void {
    console.log("Opening query panel...");

    // Create panel if it doesn't exist
    if (!state.queryPanel) {
        state.queryPanel = createQueryPanel();
    } else {
        // If panel exists but was removed from DOM, recreate it
        if (!document.body.contains(state.queryPanel)) {
            state.queryPanel = createQueryPanel();
        }
    }

    // Make sure panel is visible
    state.queryPanel.style.display = "block";

    // Focus the input field if it exists
    const inputField = state.queryPanel.querySelector("input");
    if (inputField) {
        setTimeout(() => {
            inputField.focus();
        }, 100);
    }

    console.log("Query panel opened:", state.queryPanel);
}

/**
 * Evaluates an XPath expression and highlights matching elements
 * @param xpathExpression - The XPath expression to evaluate
 * @returns The number of elements matched
 */
function evaluateXPath(xpathExpression: string): number {
    console.log("Evaluating XPath:", xpathExpression);

    // Clear previously highlighted elements
    clearHighlightedElements();

    try {
        // Evaluate the XPath
        const result = document.evaluate(
            xpathExpression,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );

        console.log(`Found ${result.snapshotLength} elements`);

        // Update counter
        state.queryResultCount = result.snapshotLength;

        // Highlight the elements
        for (let i = 0; i < result.snapshotLength; i++) {
            const element = result.snapshotItem(i) as HTMLElement;
            if (element) {
                highlightElement(element);
            }
        }

        // Update the results counter in the UI
        updateResultCount();

        return result.snapshotLength;
    } catch (error: unknown) {
        console.error("Error evaluating XPath:", error);
        state.queryResultCount = 0;
        const errorMessage = error instanceof Error ? error.message : String(error);
        updateResultCount(errorMessage);
        return 0;
    }
}

/**
 * Clears all highlighted elements
 */
function clearHighlightedElements(): void {
    // Remove highlight from all elements
    state.highlightedElements.forEach(element => {
        if (element && element instanceof HTMLElement) {
            element.style.removeProperty('outline');
            element.style.removeProperty('outline-offset');
        }
    });

    // Clear array
    state.highlightedElements = [];
}

/**
 * Highlights an element on the page
 * @param element - The element to highlight
 */
function highlightElement(element: HTMLElement): void {
    if (!element || !(element instanceof HTMLElement)) return;

    // Apply highlight styles
    element.style.outline = '2px solid #4285f4';
    element.style.outlineOffset = '2px';

    // Add to highlighted elements
    state.highlightedElements.push(element);
}

/**
 * Updates the result count display in the query panel
 * @param errorMessage - Optional error message to display
 */
function updateResultCount(errorMessage?: string): void {
    if (!state.queryPanel) return;

    const resultsCount = state.queryPanel.querySelector('#xpath-results-count');
    if (!resultsCount) return;

    if (errorMessage) {
        resultsCount.textContent = `Error: ${errorMessage}`;
        (resultsCount as HTMLElement).style.color = 'red';
    } else {
        const count = state.queryResultCount;
        resultsCount.textContent = `${count} element${count !== 1 ? 's' : ''} found`;
        (resultsCount as HTMLElement).style.color = count > 0 ? '#4285f4' : '#666';
    }
}

/**
 * Copies text to clipboard and shows a notification
 * @param text - The text to copy
 */
function copyToClipboard(text: string): void {
    // Copy to clipboard
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log("Copied to clipboard:", text);
            // Show notification
            showCopyNotification();
        })
        .catch(error => {
            console.error("Failed to copy to clipboard:", error);
        });
}

/**
 * Shows a notification that text has been copied
 */
function showCopyNotification(): void {
    // Create notification if it doesn't exist
    let notification = document.getElementById("xpath-copy-notification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "xpath-copy-notification";
        notification.className = "xpath-fixed xpath-bottom-5 xpath-left-1/2 xpath-transform -xpath-translate-x-1/2 xpath-bg-gray-800 xpath-text-white xpath-px-4 xpath-py-2 xpath-rounded xpath-z-50 xpath-opacity-0 xpath-transition";
        document.body.appendChild(notification);

        // Add any missing styles
        notification.style.opacity = "0";
        notification.style.transform = "translateX(-50%)";
        notification.style.transition = "opacity 0.3s";
    }

    // Set text and display
    notification.textContent = "XPath copied to clipboard!";
    notification.style.opacity = "1";

    // Hide after delay
    if (state.copyFeedbackTimeout) {
        clearTimeout(state.copyFeedbackTimeout);
    }

    state.copyFeedbackTimeout = window.setTimeout(() => {
        if (notification) {
            notification.style.opacity = "0";
        }
        state.copyFeedbackTimeout = null;
    }, 2000);
}

/**
 * Initialize the extension
 */
function init(): void {
    // Set up event listeners and create UI elements
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Listen for messages from the popup
    chrome.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: any) => {
        if (message.action === "openQueryPanel") {
            openQueryPanel();
            sendResponse({ success: true });
        }
        return true; // Keep the message channel open for async responses
    });
}

// Initialize when the DOM is fully loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
} 