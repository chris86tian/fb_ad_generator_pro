import * as dom from './dom.js';
import { copyToClipboard } from './copyToClipboard.js';
import { parseAdVersions } from './parser.js';
import { STORAGE_KEY_LAST_RAW_RESPONSE } from './storage.js';

// Helper function to create a single version item element (Primary Text, Headline, or Description part)
function createVersionItemElement(versionNumber, type, text, fullVersionTextForCopy) {
    const item = document.createElement('div');
    item.className = 'version-item';

    const header = document.createElement('div');
    header.className = 'preview-box-header';

    // Construct title like "Primary Text (V1)"
    // Using simple English fallbacks, recommend adding i18n keys like 'primarytextVLabel', 'headlineVLabel', etc.
    const typeKey = type.toLowerCase().replace(/\s+/g, '') + 'VLabel';
    const typeText = chrome.i18n.getMessage(typeKey) || type;
    const versionLabelShortKey = 'versionLabelShort';
    const versionLabel = chrome.i18n.getMessage(versionLabelShortKey) || 'V';
    
    const titleText = `${typeText} (${versionLabel}${versionNumber})`;
    const strong = document.createElement('strong');
    strong.textContent = titleText;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric') || 'Copy';
    copyBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
    
    const textToCopy = fullVersionTextForCopy || text || '';
    const descriptiveName = `${typeText} ${versionLabel}${versionNumber}`;
    copyBtn.addEventListener('click', () => copyToClipboard(textToCopy, descriptiveName));

    header.appendChild(strong);
    header.appendChild(copyBtn);

    const contentDisplay = document.createElement('div');
    contentDisplay.className = 'text-content-display';
    contentDisplay.textContent = text || (chrome.i18n.getMessage('notFoundText') || 'Not found');

    item.appendChild(header);
    item.appendChild(contentDisplay);
    return item;
}

export function displayAdVersionsInTabs(adVersions) { // Consider renaming to displayAllAdVariants
    console.log("displayAllAdVariants received:", JSON.stringify(adVersions, null, 2));

    const { allVersionsTabContent, multiVersionTabsContainer } = dom; 

    if (!allVersionsTabContent || !multiVersionTabsContainer) {
        console.error("Required elements not found in DOM for displayAllAdVariants.");
        return;
    }

    allVersionsTabContent.innerHTML = ''; 

    if (!adVersions || adVersions.length === 0) {
        console.warn("No ad versions to display.");
        const placeholderMsg = chrome.i18n.getMessage('tabGenerateAdCopyMessage') || 'Generate ad copy to see versions here.';
        allVersionsTabContent.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 20px 0;">${placeholderMsg}</p>`;
        multiVersionTabsContainer.style.display = 'block';
        return;
    }

    adVersions.forEach((version, index) => {
        const versionNumber = index + 1;

        const versionGroup = document.createElement('div');
        versionGroup.className = 'version-group';
        
        const versionTitleElement = document.createElement('h4');
        versionTitleElement.className = 'version-group-title';
        const versionLabelFullKey = 'versionLabelFull';
        const versionLabelFullText = chrome.i18n.getMessage(versionLabelFullKey) || 'Version';
        versionTitleElement.textContent = `${versionLabelFullText} ${versionNumber}`;
        versionGroup.appendChild(versionTitleElement);

        versionGroup.appendChild(
            createVersionItemElement(versionNumber, 'Primary Text', version.primaryText, version.primaryText)
        );
        versionGroup.appendChild(
            createVersionItemElement(versionNumber, 'Headline', version.headline, version.headline)
        );
        versionGroup.appendChild(
            createVersionItemElement(versionNumber, 'Description', version.description, version.description)
        );
        
        allVersionsTabContent.appendChild(versionGroup);
    });

    multiVersionTabsContainer.style.display = 'block';
}

export function updateAngleAdsContainerPlaceholder(showPlaceholder) {
    const placeholderTextV1 = chrome.i18n.getMessage('angleAdsPlaceholderText') || 'Will be filled...';
    const { primaryTextField, headlineField, descriptionField, multiVersionTabsContainer, allVersionsTabContent } = dom;

    if (showPlaceholder) {
        if (primaryTextField) primaryTextField.innerText = placeholderTextV1;
        if (headlineField) headlineField.innerText = placeholderTextV1;
        if (descriptionField) descriptionField.innerText = placeholderTextV1;
        
        if (multiVersionTabsContainer) multiVersionTabsContainer.style.display = 'none';
        if (allVersionsTabContent) {
             const variantsPlaceholderMsg = chrome.i18n.getMessage('tabGenerateAdCopyMessage') || 'Generate ad copy to see versions here.';
             allVersionsTabContent.innerHTML = `<p style="text-align: center; color: var(--text-light); padding: 20px 0;">${variantsPlaceholderMsg}</p>`;
        }
    } else {
        // If not showing V1 placeholder, it means V1 content is coming or variants are shown.
        // The multiVersionTabsContainer visibility is primarily handled by displayAdVersionsInTabs.
        // If V1 fields are empty but variants are shown, they should retain their specific content or "Not found".
    }
}

export async function loadAndDisplayAdsFromStorage() {
    console.log("Attempting to load and display ads from storage...");
    const result = await chrome.storage.local.get(STORAGE_KEY_LAST_RAW_RESPONSE);
    const rawResponse = result[STORAGE_KEY_LAST_RAW_RESPONSE];

    const notFoundMsg = chrome.i18n.getMessage('notFoundText') || 'Not found';
    const initialPlaceholderMsgV1 = chrome.i18n.getMessage('angleAdsPlaceholderText') || 'Will be filled...';

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
            updateAngleAdsContainerPlaceholder(false); // Ensure V1 placeholders are not shown if content exists
        } else {
            console.warn("Could not parse ad versions from stored raw response, or no versions found.");
            if (dom.primaryTextField) dom.primaryTextField.innerText = initialPlaceholderMsgV1;
            if (dom.headlineField) dom.headlineField.innerText = initialPlaceholderMsgV1;
            if (dom.descriptionField) dom.descriptionField.innerText = initialPlaceholderMsgV1;
            displayAdVersionsInTabs([]); // Show placeholder in variants section
            updateAngleAdsContainerPlaceholder(false); // Keep V1 fields as they are (showing placeholder), but ensure variants section is visible (handled by displayAdVersionsInTabs)
        }
    } else {
        console.log("No raw response found in storage. Displaying placeholders for V1 and variants section.");
        updateAngleAdsContainerPlaceholder(true); // This will set V1 placeholders and hide variants container, then set placeholder in (hidden) variants content
    }
}

// Export switchTab function for backward compatibility, but it's now a no-op
export function switchTab() {
    console.log("switchTab called but tabs have been removed. This is a no-op function for backward compatibility.");
    // No operation needed as tabs have been removed
}
