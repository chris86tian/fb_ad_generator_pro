import * as dom from './dom.js';
import { updateTabPlaceholders } from './localization.js';
import { copyToClipboard } from './copyToClipboard.js';
import { parseAdVersions } from './parser.js'; // Import parser
import { STORAGE_KEY_LAST_RAW_RESPONSE } from './storage.js'; // Import storage key

// Helper function to create a single version item element for tabs
function createVersionItemElement(versionNumber, type, text, fullVersionTextForCopy) {
    const item = document.createElement('div');
    item.className = 'version-item';

    const header = document.createElement('div');
    header.className = 'preview-box-header';

    const titleKey = `versionTabTitle`;
    const titleText = `${chrome.i18n.getMessage(titleKey) || 'Version'} ${versionNumber} (${type})`;
    const strong = document.createElement('strong');
    strong.textContent = titleText;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric') || 'Copy';
    copyBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
    
    const textToCopy = fullVersionTextForCopy || text || '';
    // Use a descriptive string for the field name when calling copyToClipboard
    const descriptiveName = `${type} Version ${versionNumber}`;
    copyBtn.addEventListener('click', () => copyToClipboard(textToCopy, descriptiveName));

    header.appendChild(strong);
    header.appendChild(copyBtn);

    const contentDisplay = document.createElement('div');
    contentDisplay.className = 'text-content-display'; // This is NOT contenteditable
    contentDisplay.textContent = text || (chrome.i18n.getMessage('notFoundText') || 'Not found');

    item.appendChild(header);
    item.appendChild(contentDisplay);
    return item;
}

export function displayAdVersionsInTabs(adVersions) {
    console.log("displayAdVersionsInTabs received:", JSON.stringify(adVersions, null, 2));

    const { primaryTextsTabContent, headlinesTabContent, descriptionsTabContent, multiVersionTabsContainer } = dom;

    if (!primaryTextsTabContent || !headlinesTabContent || !descriptionsTabContent || !multiVersionTabsContainer) {
        console.error("Tab content elements not found in DOM for displayAdVersionsInTabs.");
        return;
    }

    primaryTextsTabContent.innerHTML = '';
    headlinesTabContent.innerHTML = '';
    descriptionsTabContent.innerHTML = '';

    if (!adVersions || adVersions.length === 0) {
        console.warn("No ad versions to display in tabs.");
        updateTabPlaceholders(true);
        multiVersionTabsContainer.style.display = 'block';
        updateAngleAdsContainerPlaceholder(false); // Keep V1 placeholder hidden if tabs are shown (even if empty)
        if (dom.tabLinks && dom.tabLinks.length > 0) {
            switchTab(dom.tabLinks[0]);
        }
        return;
    }

    updateTabPlaceholders(false);

    adVersions.forEach((version, index) => {
        const versionNumber = index + 1;
        
        if (version.primaryText) {
            primaryTextsTabContent.appendChild(createVersionItemElement(versionNumber, 'Primary Text', version.primaryText, version.primaryText));
        } else {
             primaryTextsTabContent.appendChild(createVersionItemElement(versionNumber, 'Primary Text', null, null));
        }
        if (version.headline) {
            headlinesTabContent.appendChild(createVersionItemElement(versionNumber, 'Headline', version.headline, version.headline));
        } else {
            headlinesTabContent.appendChild(createVersionItemElement(versionNumber, 'Headline', null, null));
        }
        if (version.description) {
            descriptionsTabContent.appendChild(createVersionItemElement(versionNumber, 'Description', version.description, version.description));
        } else {
            descriptionsTabContent.appendChild(createVersionItemElement(versionNumber, 'Description', null, null));
        }
    });

    multiVersionTabsContainer.style.display = 'block';
    updateAngleAdsContainerPlaceholder(false);

    if (dom.tabLinks && dom.tabLinks.length > 0) {
        dom.tabLinks.forEach(link => link.classList.remove('active'));
        dom.tabContentsArr.forEach(content => content.classList.remove('active'));

        dom.tabLinks[0].classList.add('active');
        const firstTabContentId = dom.tabLinks[0].dataset.tab;
        const firstTabContent = document.getElementById(firstTabContentId);
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        } else {
            console.warn(`Content for first tab ${firstTabContentId} not found.`);
        }
    }
}

export function updateAngleAdsContainerPlaceholder(showPlaceholder) {
    const placeholderText = chrome.i18n.getMessage('angleAdsPlaceholderText');
    const { primaryTextField, headlineField, descriptionField, multiVersionTabsContainer } = dom;

    if (showPlaceholder) {
        if (primaryTextField) primaryTextField.innerText = placeholderText;
        if (headlineField) headlineField.innerText = placeholderText;
        if (descriptionField) descriptionField.innerText = placeholderText;
        if (multiVersionTabsContainer) multiVersionTabsContainer.style.display = 'none';
    } else {
        // If not showing placeholder, it means content is coming or tabs are shown
        // The V1 fields will be populated by loadAndDisplayAdsFromStorage or adGeneration
        if (multiVersionTabsContainer) multiVersionTabsContainer.style.display = 'block';
    }
}

export function switchTab(clickedTab) {
  if (!clickedTab) return;

  dom.tabLinks.forEach(link => link.classList.remove('active'));
  dom.tabContentsArr.forEach(content => content.classList.remove('active'));

  clickedTab.classList.add('active');
  const contentId = clickedTab.dataset.tab;
  const activeContent = document.getElementById(contentId);
  if (activeContent) {
    activeContent.classList.add('active');
  } else {
    console.warn(`Content for tab ${contentId} not found.`);
  }
}

export async function loadAndDisplayAdsFromStorage() {
    console.log("Attempting to load and display ads from storage...");
    const result = await chrome.storage.local.get(STORAGE_KEY_LAST_RAW_RESPONSE);
    const rawResponse = result[STORAGE_KEY_LAST_RAW_RESPONSE];

    const notFoundMsg = chrome.i18n.getMessage('notFoundText') || 'Not found';
    const initialPlaceholderMsg = chrome.i18n.getMessage('angleAdsPlaceholderText') || 'Wird nach Generierung mit Version 1 gefüllt...';

    if (rawResponse) {
        console.log("Found raw response in storage:", rawResponse);
        const adVersions = parseAdVersions(rawResponse);
        console.log("Parsed ad versions from storage:", JSON.stringify(adVersions, null, 2));

        if (adVersions && adVersions.length > 0) {
            const v1 = adVersions[0];
            if (dom.primaryTextField) dom.primaryTextField.innerText = v1.primaryText || notFoundMsg;
            if (dom.headlineField) dom.headlineField.innerText = v1.headline || notFoundMsg;
            if (dom.descriptionField) dom.descriptionField.innerText = v1.description || notFoundMsg;

            displayAdVersionsInTabs(adVersions); 
            updateAngleAdsContainerPlaceholder(false); 
        } else {
            console.warn("Could not parse ad versions from stored raw response, or no versions found.");
            if (dom.primaryTextField) dom.primaryTextField.innerText = initialPlaceholderMsg;
            if (dom.headlineField) dom.headlineField.innerText = initialPlaceholderMsg;
            if (dom.descriptionField) dom.descriptionField.innerText = initialPlaceholderMsg;
            // updateAngleAdsContainerPlaceholder(true); // This would hide tabs if called here
            updateTabPlaceholders(true); 
            if (dom.primaryTextsTabContent) dom.primaryTextsTabContent.innerHTML = `<p>${chrome.i18n.getMessage('tabGenerateAdCopyMessage')}</p>`;
            if (dom.headlinesTabContent) dom.headlinesTabContent.innerHTML = `<p>${chrome.i18n.getMessage('tabGenerateAdCopyMessage')}</p>`;
            if (dom.descriptionsTabContent) dom.descriptionsTabContent.innerHTML = `<p>${chrome.i18n.getMessage('tabGenerateAdCopyMessage')}</p>`;
            if (dom.multiVersionTabsContainer) dom.multiVersionTabsContainer.style.display = 'block';
        }
    } else {
        console.log("No raw response found in storage. Displaying placeholders.");
        if (dom.primaryTextField) dom.primaryTextField.innerText = initialPlaceholderMsg;
        if (dom.headlineField) dom.headlineField.innerText = initialPlaceholderMsg;
        if (dom.descriptionField) dom.descriptionField.innerText = initialPlaceholderMsg;
        updateAngleAdsContainerPlaceholder(true); // This will hide tabs
        updateTabPlaceholders(true); // This sets placeholder text for tabs (which are hidden by previous line)
    }
}
