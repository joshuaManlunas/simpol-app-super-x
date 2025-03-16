/**
 * Super-X XPath Query Generator
 * Popup functionality to communicate with the content script
 */

/**
 * Sends a message to the active tab to open the XPath query panel
 */
const openQueryPanel = async () => {
  try {
    console.log("Opening XPath Query Panel from popup");

    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      console.error("No active tab found");
      return;
    }

    console.log("Sending message to tab:", activeTab.id);

    // Send the message to the content script
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      action: "openQueryPanel",
      timestamp: Date.now(), // Add timestamp to prevent caching of the message
    });

    console.log("Response from content script:", response);

    // Only close popup if successful
    if (response && response.success) {
      window.close();
    } else {
      throw new Error("Content script did not return success");
    }
  } catch (error) {
    console.error("Error opening query panel:", error);

    // Show error in the popup if sending fails
    const errorMessage = document.createElement("div");
    errorMessage.textContent =
      "Failed to open query panel. Try refreshing the page.";
    errorMessage.style.color = "red";
    errorMessage.style.padding = "10px 0";
    document.body.appendChild(errorMessage);
  }
};

/**
 * Toggles the extension's enabled state
 * @param {boolean} isEnabled - Whether the extension should be enabled
 */
const toggleExtension = async (isEnabled) => {
  try {
    // Save state to Chrome storage
    await chrome.storage.sync.set({ isEnabled });

    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      console.error("No active tab found");
      return;
    }

    // Notify content script about state change
    await chrome.tabs.sendMessage(activeTab.id, {
      action: "toggleExtension",
      isEnabled,
    });

    // Update UI based on state
    const openPanelButton = document.getElementById("openQueryPanel");
    if (openPanelButton) {
      openPanelButton.disabled = !isEnabled;
      openPanelButton.classList.toggle("disabled", !isEnabled);
    }

    // Update instruction card and features section opacity
    const instructionCard = document.querySelector(".instruction-card");
    const featuresSection = document.querySelector(".features-grid").parentNode;

    if (instructionCard && featuresSection) {
      instructionCard.style.opacity = isEnabled ? "1" : "0.5";
      featuresSection.style.opacity = isEnabled ? "1" : "0.5";
    }
  } catch (error) {
    console.error("Error toggling extension:", error);
  }
};

/**
 * Initialize popup event listeners
 */
const initPopup = async () => {
  const openPanelButton = document.getElementById("openQueryPanel");
  const extensionToggle = document.getElementById("extensionToggle");

  if (openPanelButton) {
    openPanelButton.addEventListener("click", openQueryPanel);
  }

  if (extensionToggle) {
    // Load saved state from storage
    try {
      const result = await chrome.storage.sync.get("isEnabled");
      const isEnabled =
        result.isEnabled === undefined ? true : result.isEnabled;

      // Update toggle to match saved state
      extensionToggle.checked = isEnabled;

      // Apply initial state to UI
      toggleExtension(isEnabled);

      // Add change listener
      extensionToggle.addEventListener("change", (e) => {
        toggleExtension(e.target.checked);
      });
    } catch (error) {
      console.error("Error loading extension state:", error);
      // Default to enabled if there's an error
      extensionToggle.checked = true;
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPopup);
} else {
  initPopup();
}
