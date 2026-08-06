chrome.runtime.onInstalled.addListener((_reason) => {
    /*
    chrome.tabs.create({
        url: 'shuttingstars.html'
    });
    */
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "open-side-panel") {
    chrome.sidePanel.open({ tabId: sender.tab?.id });
  }
});