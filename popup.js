document.getElementById("openQueryPanel").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "openQueryPanel" })
    window.close() // Close the popup
  })
})

