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

function stop() {
    var prevButton = document.getElementsByClassName("jp-stop").item(0);

    if (prevButton != null) {
        prevButton.click();
    }
}

function storageChanged(changes, area) {
    if (area === 'local' && changes.activeTabId != null && changes.activeTabId.newValue != null) {
        if (changes.activeTabId.newValue != -1) {
            chrome.action.setBadgeText({ text: 'ON' });
            chrome.action.setBadgeBackgroundColor({ color: '#4688F1' });
        } else {
            chrome.action.setBadgeText({ text: "" });
        }
    }
}

function activateExtension(tab) {
    chrome.action.setTitle({
        title: "Controlling " + (new URL(tab.url).hostname)
    });
    chrome.storage.local.set({ activeTabId: tab.id });
}

function deactivateExtension() {
    chrome.action.setTitle({
        title: 'Click this while in an Ampache tab to activate'
    });
    chrome.storage.local.set({ activeTabId: -1 });
}

function extensionClicked(tab) {
    //console.log('tab: ' + JSON.stringify(tab));

    chrome.storage.local.get('activeTabId', result => {
        if (result.activeTabId != -1) {
            deactivateExtension();
        } else {
            activateExtension(tab);
        }
    });
}

function extensionStarted() {
    chrome.storage.local.set({ activeTabId: -1 });
}

function commandFired(command) {
    console.log("command recieved: " + command);

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
            case "stop":
                chrome.scripting.executeScript({
                    target: { tabId: result.activeTabId },
                    function: stop
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