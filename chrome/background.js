function playPause() {
    var playButton = document.getElementsByClassName("jp-play").item(0);

    if (playButton != null && playButton.style.display != "none") {
        playButton.click();
        return;
    }


    var pauseButton = document.getElementsByClassName("jp-pause").item(0);

    if (pauseButton != null && pauseButton.style.display != "none") {
        pauseButton.click();
        return;
    }
}

function playNext() {
    var nextButton = document.getElementsByClassName("jp-next").item(0);

    if (nextButton != null) {
        nextButton.click();
    }
}

function playPrev() {
    var prevButton = document.getElementsByClassName("jp-previous").item(0);

    if (prevButton != null) {
        prevButton.click();
    }
}

function storageChanged(changes, area) {
    console.log("changes: " + JSON.stringify(changes));

    if (area === 'local' && changes.activeTabId != null && changes.activeTabId.newValue != null) {
        if (changes.activeTabId.newValue != -1) {
            chrome.action.setBadgeText({ text: 'ON' });
            chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
        } else {
            chrome.action.setBadgeText({ text: "" });
        }
    }
}

function extensionClicked(tab) {
    console.log('tab: ' + JSON.stringify(tab));

    chrome.storage.local.get('activeTabId', result => {
        if (result.activeTabId != -1) {
            chrome.action.setTitle({
                title: 'Click this while in an Ampache tab to use this extension'
            });
            chrome.storage.local.set({ activeTabId: -1 });
        } else {
            chrome.action.setTitle({
                title: "Observing " + (new URL(tab.url).hostname)
            });
            chrome.storage.local.set({ activeTabId: tab.id });
        }
    });
}

function extensionStarted() {
    chrome.storage.local.set({ activeTabId: -1 });
}

function commandFired(command) {
    chrome.storage.local.get('activeTabId', result => {
        if (result.activeTabId == -1) {
            return;
        }

        switch (command) {
            case "playNext":
                chrome.scripting.executeScript({
                    target: { tabId: result.activeTabId },
                    function: playNext
                });
                break;
            case "playPrev":
                chrome.scripting.executeScript({
                    target: { tabId: result.activeTabId },
                    function: playPrev
                });
                break;
            case "playPause":
                chrome.scripting.executeScript({
                    target: { tabId: result.activeTabId },
                    function: playPause
                });
                break;
        }
    });
}

function tabClosed(tabId) {
    chrome.storage.local.get('activeTabId', result => {
        if (result.activeTabId == tabId) {
            extensionClicked(null);
        }
    });
}



chrome.storage.onChanged.addListener(storageChanged);
chrome.action.onClicked.addListener(extensionClicked);
chrome.runtime.onInstalled.addListener(extensionStarted);
chrome.commands.onCommand.addListener(commandFired);
chrome.tabs.onRemoved.addListener(tabClosed);