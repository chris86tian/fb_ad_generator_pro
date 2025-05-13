import * as dom from './dom.js';
import {
    STORAGE_KEY_INPUT,
    // STORAGE_KEY_TARGET_AUDIENCE, // Removed
    STORAGE_KEY_PRIMARY,
    STORAGE_KEY_HEADLINE,
    STORAGE_KEY_DESCRIPTION,
    STORAGE_KEY_COPYWRITER,
    STORAGE_KEY_ADDRESS_FORM,
    STORAGE_KEY_LAST_RAW_RESPONSE,
    STORAGE_KEY_ACTIVE_PERSONA_ID, // Added
    STORAGE_KEY_PERSONA_LIST // Added
} from './storage.js';
import { parseAdVersions } from './parser.js';
import { displayAdVersionsInTabs } from './adDisplay.js';
import { showView } from './viewManagement.js'; // Needed for change persona button

// Helper to get active persona details (duplicate from adGeneration, consider moving to a shared util)
async function getActivePersonaDetails() {
    const activeId = (await chrome.storage.local.get(STORAGE_KEY_ACTIVE_PERSONA_ID))[STORAGE_KEY_ACTIVE_PERSONA_ID];
    if (!activeId) {
        return null;
    }
    const personaList = (await chrome.storage.local.get(STORAGE_KEY_PERSONA_LIST))[STORAGE_KEY_PERSONA_LIST] || [];
    return personaList.find(p => p.id === activeId);
}

// Function to update the display of the active persona in the main view
export async function updateActivePersonaDisplay() { // Added export keyword
    if (!dom.activePersonaDisplay) return;

    const activePersona = await getActivePersonaDetails();

    if (activePersona) {
        // Display the base description or the beginning of the generated text as the name
        const displayName = activePersona.baseDescription || activePersona.generatedText.substring(0, 50) + '...';
        dom.activePersonaDisplay.innerHTML = `<strong>${displayName}</strong>`;
        dom.activePersonaDisplay.title = activePersona.generatedText; // Show full text on hover
    } else {
        dom.activePersonaDisplay.innerHTML = `<span class="no-persona" data-i18n-key="noActivePersonaSelected">${chrome.i18n.getMessage('noActivePersonaSelected')}</span>`;
        dom.activePersonaDisplay.title = '';
    }
}

// Save current selections in the main view to local storage
export async function saveMainViewSelections() {
    const dataToSave = {};
    if (dom.inputContent) dataToSave[STORAGE_KEY_INPUT] = dom.inputContent.value;
    // Target audience input removed
    // if (dom.targetAudienceInput) dataToSave[STORAGE_KEY_TARGET_AUDIENCE] = dom.targetAudienceInput.value;
    if (dom.primaryTextField) dataToSave[STORAGE_KEY_PRIMARY] = dom.primaryTextField.dataset.originalContent || dom.primaryTextField.innerText;
    if (dom.headlineField) dataToSave[STORAGE_KEY_HEADLINE] = dom.headlineField.dataset.originalContent || dom.headlineField.innerText;
    if (dom.descriptionField) dataToSave[STORAGE_KEY_DESCRIPTION] = dom.descriptionField.dataset.originalContent || dom.descriptionField.innerText;
    if (dom.copywriterSelect) dataToSave[STORAGE_KEY_COPYWRITER] = dom.copywriterSelect.value;
    if (dom.formOfAddressSelect) dataToSave[STORAGE_KEY_ADDRESS_FORM] = dom.formOfAddressSelect.value;
    // Note: We don't save STORAGE_KEY_LAST_RAW_RESPONSE here, it's saved during generation.
    // Note: We don't save the active persona ID here, it's managed separately.

    try {
        await chrome.storage.local.set(dataToSave);
        // console.log("Main view selections saved:", dataToSave);
    } catch (error) {
        console.error("Error saving main view selections:", error);
    }
}

// Load saved selections into the main view
export async function loadMainViewSelections() {
    const keysToLoad = [
        STORAGE_KEY_INPUT,
        // STORAGE_KEY_TARGET_AUDIENCE, // Removed
        STORAGE_KEY_PRIMARY,
        STORAGE_KEY_HEADLINE,
        STORAGE_KEY_DESCRIPTION,
        STORAGE_KEY_COPYWRITER,
        STORAGE_KEY_ADDRESS_FORM,
        STORAGE_KEY_LAST_RAW_RESPONSE // Load last response to potentially restore tabs
    ];

    try {
        const result = await chrome.storage.local.get(keysToLoad);

        if (dom.inputContent && result[STORAGE_KEY_INPUT] !== undefined) dom.inputContent.value = result[STORAGE_KEY_INPUT];
        // Target audience input removed
        // if (dom.targetAudienceInput && result[STORAGE_KEY_TARGET_AUDIENCE] !== undefined) dom.targetAudienceInput.value = result[STORAGE_KEY_TARGET_AUDIENCE];
        if (dom.copywriterSelect && result[STORAGE_KEY_COPYWRITER] !== undefined) dom.copywriterSelect.value = result[STORAGE_KEY_COPYWRITER];
        if (dom.formOfAddressSelect && result[STORAGE_KEY_ADDRESS_FORM] !== undefined) dom.formOfAddressSelect.value = result[STORAGE_KEY_ADDRESS_FORM];

        const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
        const lastRawResponse = result[STORAGE_KEY_LAST_RAW_RESPONSE];

        if (lastRawResponse) {
            // Try to parse and display the last generated ads
            const adVersions = parseAdVersions(lastRawResponse);
            if (adVersions.length > 0) {
                const v1 = adVersions[0];
                if (dom.primaryTextField) { dom.primaryTextField.innerText = v1.primaryText || willBeFilledMsg; dom.primaryTextField.dataset.originalContent = v1.primaryText || ''; }
                if (dom.headlineField) { dom.headlineField.innerText = v1.headline || willBeFilledMsg; dom.headlineField.dataset.originalContent = v1.headline || ''; }
                if (dom.descriptionField) { dom.descriptionField.innerText = v1.description || willBeFilledMsg; dom.descriptionField.dataset.originalContent = v1.description || ''; }
                displayAdVersionsInTabs(adVersions);
                if (dom.multiVersionTabsContainer) dom.multiVersionTabsContainer.style.display = 'block';
            } else {
                // If parsing fails, maybe show raw response or default text?
                if (dom.primaryTextField) { dom.primaryTextField.innerText = result[STORAGE_KEY_PRIMARY] || willBeFilledMsg; dom.primaryTextField.dataset.originalContent = result[STORAGE_KEY_PRIMARY] || ''; }
                if (dom.headlineField) { dom.headlineField.innerText = result[STORAGE_KEY_HEADLINE] || willBeFilledMsg; dom.headlineField.dataset.originalContent = result[STORAGE_KEY_HEADLINE] || ''; }
                if (dom.descriptionField) { dom.descriptionField.innerText = result[STORAGE_KEY_DESCRIPTION] || willBeFilledMsg; dom.descriptionField.dataset.originalContent = result[STORAGE_KEY_DESCRIPTION] || ''; }
                if (dom.multiVersionTabsContainer) dom.multiVersionTabsContainer.style.display = 'none'; // Hide tabs if no valid versions
            }
        } else {
            // Load individual fields if no raw response exists
            if (dom.primaryTextField) { dom.primaryTextField.innerText = result[STORAGE_KEY_PRIMARY] || willBeFilledMsg; dom.primaryTextField.dataset.originalContent = result[STORAGE_KEY_PRIMARY] || ''; }
            if (dom.headlineField) { dom.headlineField.innerText = result[STORAGE_KEY_HEADLINE] || willBeFilledMsg; dom.headlineField.dataset.originalContent = result[STORAGE_KEY_HEADLINE] || ''; }
            if (dom.descriptionField) { dom.descriptionField.innerText = result[STORAGE_KEY_DESCRIPTION] || willBeFilledMsg; dom.descriptionField.dataset.originalContent = result[STORAGE_KEY_DESCRIPTION] || ''; }
            if (dom.multiVersionTabsContainer) dom.multiVersionTabsContainer.style.display = 'none'; // Hide tabs if no versions
        }

        // Load and display the active persona
        await updateActivePersonaDisplay();

        // console.log("Main view selections loaded.");

    } catch (error) {
        console.error("Error loading main view selections:", error);
    }
}

// Setup listeners for input changes to save automatically
export function setupMainViewListeners() {
    const elementsToWatch = [
        dom.inputContent,
        // dom.targetAudienceInput, // Removed
        dom.primaryTextField,
        dom.headlineField,
        dom.descriptionField,
        dom.copywriterSelect,
        dom.formOfAddressSelect
    ];

    elementsToWatch.forEach(element => {
        if (element) {
            const eventType = (element.tagName === 'SELECT' || element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') ? 'input' : 'input'; // Use 'input' for contenteditable too
            element.addEventListener(eventType, saveMainViewSelections);
            // For contenteditable, also listen to blur to capture final state
            if (element.isContentEditable) {
                element.addEventListener('blur', saveMainViewSelections);
            }
        }
    });

    // Listener for the "Change Persona" button
    if (dom.changePersonaBtn) {
        dom.changePersonaBtn.addEventListener('click', () => {
            showView('personaListView'); // Navigate to the persona list view
        });
    }

    // Add listener for changes in active persona storage to update display
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && (changes[STORAGE_KEY_ACTIVE_PERSONA_ID] || changes[STORAGE_KEY_PERSONA_LIST])) {
             // Check if the main view is currently visible before updating
             if (dom.mainView && dom.mainView.style.display !== 'none') {
                 console.log("Active persona or list changed, updating display.");
                 updateActivePersonaDisplay();
             }
        }
    });
}
