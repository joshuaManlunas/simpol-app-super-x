/**
 * Super-X XPath Query Generator
 * Popup functionality to communicate with the content script
 */

/**
 * Sends a message to the active tab to open the XPath query panel
 */
const openQueryPanel = async () => {
  try {
    // Get the current active tab
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!activeTab?.id) {
      console.error("No active tab found");
      return;
    }

    // Send the message to the content script
    await chrome.tabs.sendMessage(activeTab.id, { action: "openQueryPanel" });

    // Close the popup
    window.close();
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
 * Initialize popup event listeners
 */
const initPopup = () => {
  const openPanelButton = document.getElementById("openQueryPanel");

  if (openPanelButton) {
    openPanelButton.addEventListener("click", openQueryPanel);
  }
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPopup);
} else {
  initPopup();
}
