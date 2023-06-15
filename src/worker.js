function main () {
  // Finds the text to get the destination branch
  var mergeTextRegex = /wants to merge [0-9]* commits? into ((master)|(main))/ig;
  const mergeText = document.querySelector("#partial-discussion-header[data-pull-is-open=true]").innerText
  var matches = mergeTextRegex.exec(mergeText);
  const notToMain = !matches;
  // Its not main/master. No alert needed
  if (notToMain) return;

  const destinationBranch = matches[1];

  // Adds global CSS to highlight the destination branch
  var style = document.createElement('style');
  style.innerHTML = `
    #partial-discussion-header[data-pull-is-open=true] div div.flex-auto {
      display: flex;
      align-items: center;
    }
    #partial-discussion-header[data-pull-is-open=true] div div.flex-auto > *:not(:empty) {
      margin: 0 3px;
    }
    #partial-discussion-header[data-pull-is-open=true] .base-ref {
      font-size: 22px;
      background-color: #FF030038;
      margin: 4px;
    }
    #partial-discussion-header[data-pull-is-open=true] .base-ref .css-truncate-target {
      color: #F00 !important;
    }
  `;
  document.head.appendChild(style);

  // Inserts the warning message above the merge button
  // Its container takes a bit to appear, so keep checking for it (a couple of times)
  let checkCount = 0;
  const interval = window.setInterval(() => {
    if (checkCount++ > 10) window.clearInterval(interval);

    const mergeButtonContainer = document.querySelector(".merge-message");
    if (!mergeButtonContainer) return;
    window.clearInterval(interval);
    const warningMessage = document.createElement('div');
    warningMessage.innerText = `You're about to merge into the ${destinationBranch} branch! Make sure you're ready for the upcoming adventure.`;
    warningMessage.style = `
      background-color: #FF030038;
      color: #F00;
      font-size: 16px;
      padding: 8px;
      border-radius: 8px;
      margin-bottom: 16px;
    `;
    mergeButtonContainer.prepend(warningMessage);
  }, 1000);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url?.match(/https?:\/\/github\.com\//)) return undefined;
  if (changeInfo.status !== 'complete') return undefined;
  
  chrome.scripting.executeScript({
    target: { tabId },
    func: main
  });
});
