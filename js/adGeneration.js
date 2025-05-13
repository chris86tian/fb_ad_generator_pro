import * as dom from './dom.js';
import { getSystemPrompt } from './prompt.js';
import { callOpenAI } from './api.js';
import { parseAdVersions } from './parser.js';
import { getApiKey, getSelectedModel } from './settings.js';
import { displayAdVersionsInTabs, updateAngleAdsContainerPlaceholder } from './adDisplay.js';
import { saveToHistory } from './history.js';
import {
    STORAGE_KEY_LAST_RAW_RESPONSE,
    STORAGE_KEY_PERSONA_LIST,
    STORAGE_KEY_ACTIVE_PERSONA_ID,
    STORAGE_KEY_INPUT,
    STORAGE_KEY_PRIMARY,
    STORAGE_KEY_HEADLINE,
    STORAGE_KEY_DESCRIPTION,
    STORAGE_KEY_COPYWRITER,
    STORAGE_KEY_ADDRESS_FORM
} from './storage.js';
import { updateTabPlaceholders } from './localization.js';
import { saveMainViewSelections } from './mainViewPersistence.js';
// import { showView } from './viewManagement.js'; // Not directly used for navigation here

// Helper function to escape HTML (already defined, ensure it's accessible or defined here if not imported)
function escapeHtml(unsafe) {
    if (unsafe === null || typeof unsafe === 'undefined') return '';
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "<")
         .replace(/>/g, ">")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

async function getActivePersonaDetails() {
    const activeIdResult = await chrome.storage.local.get(STORAGE_KEY_ACTIVE_PERSONA_ID);
    const activeId = activeIdResult[STORAGE_KEY_ACTIVE_PERSONA_ID];

    if (!activeId) {
        console.warn("No active persona ID found in storage.");
        return null;
    }

    const personaListResult = await chrome.storage.local.get(STORAGE_KEY_PERSONA_LIST);
    const personaList = personaListResult[STORAGE_KEY_PERSONA_LIST] || [];
    const activePersona = personaList.find(p => p.id === activeId);

    if (!activePersona) {
        console.warn(`Active persona with ID ${activeId} not found in persona list.`);
        // It's possible the active ID points to a deleted persona. Clear it.
        await chrome.storage.local.remove(STORAGE_KEY_ACTIVE_PERSONA_ID);
        return null;
    }
    console.log("Active persona details fetched:", activePersona);
    return activePersona;
}

async function generateAdCopy() {
    if (!dom.inputContent || !dom.primaryTextField || !dom.headlineField || !dom.descriptionField || !dom.copywriterSelect || !dom.formOfAddressSelect) {
        console.error("One or more DOM elements are missing for ad generation.");
        return;
    }

    const apiKey = await getApiKey();
    const model = await getSelectedModel();

    if (!apiKey) {
        alert(chrome.i18n.getMessage('errorApiKeyMissing'));
        if (dom.primaryTextField) dom.primaryTextField.innerText = chrome.i18n.getMessage('errorApiKeyMissing');
        return;
    }

    const activePersona = await getActivePersonaDetails();
    if (!activePersona) {
        const noPersonaMsg = chrome.i18n.getMessage('errorNoActivePersonaForAdGeneration');
        alert(noPersonaMsg);
        if (dom.primaryTextField) dom.primaryTextField.innerText = noPersonaMsg;
        if (dom.headlineField) dom.headlineField.innerText = "";
        if (dom.descriptionField) dom.descriptionField.innerText = "";
        updateAngleAdsContainerPlaceholder(true, noPersonaMsg);
        updateTabPlaceholders(true, noPersonaMsg);
        return;
    }
    const personaTextForPrompt = activePersona.generatedText;


    const input = dom.inputContent.value.trim();
    const copywriter = dom.copywriterSelect.value;
    const formOfAddress = dom.formOfAddressSelect.value;

    if (!input) {
        alert(chrome.i18n.getMessage('errorNoInputContent'));
        return;
    }

    // Update UI to show "Generating..."
    const generatingText = chrome.i18n.getMessage('generatingText');
    if (dom.primaryTextField) dom.primaryTextField.innerText = generatingText;
    if (dom.headlineField) dom.headlineField.innerText = generatingText;
    if (dom.descriptionField) dom.descriptionField.innerText = generatingText;
    updateAngleAdsContainerPlaceholder(true, generatingText); // Show placeholder with "Generating..."
    updateTabPlaceholders(true, generatingText); // Update tab placeholders

    try {
        const systemContent = getSystemPrompt(copywriter, formOfAddress, personaTextForPrompt);
        const userContent = input;

        console.log("System Prompt for OpenAI:", systemContent);
        console.log("User Content for OpenAI:", userContent);

        // callOpenAI now directly returns the raw ad text string or throws an API error.
        const rawAdText = await callOpenAI(apiKey, model, systemContent, userContent);
        console.log("Raw Ad Text from OpenAI:", rawAdText);

        if (rawAdText && rawAdText.trim() !== '') {
            // Save raw response to storage
            await chrome.storage.local.set({ [STORAGE_KEY_LAST_RAW_RESPONSE]: rawAdText });

            const adVersions = parseAdVersions(rawAdText);
            console.log("Parsed Ad Versions:", adVersions);

            if (adVersions.length > 0) {
                displayAdVersionsInTabs(adVersions); // Display all versions in tabs
                updateAngleAdsContainerPlaceholder(false); // Hide placeholder after successful generation
                updateTabPlaceholders(false); // Remove placeholder text from tabs

                // Display the first version in the main preview boxes
                if (dom.primaryTextField) {
                    dom.primaryTextField.innerText = adVersions[0].primaryText || chrome.i18n.getMessage('notFoundText');
                    dom.primaryTextField.dataset.originalContent = adVersions[0].primaryText || '';
                }
                if (dom.headlineField) {
                    dom.headlineField.innerText = adVersions[0].headline || chrome.i18n.getMessage('notFoundText');
                    dom.headlineField.dataset.originalContent = adVersions[0].headline || '';
                }
                if (dom.descriptionField) {
                    dom.descriptionField.innerText = adVersions[0].description || chrome.i18n.getMessage('notFoundText');
                    dom.descriptionField.dataset.originalContent = adVersions[0].description || '';
                }

                // Save to history
                await saveToHistory({
                    inputContent: input,
                    copywriter: copywriter,
                    formOfAddress: formOfAddress,
                    activePersonaId: activePersona.id, // Save ID of used persona
                    activePersonaBaseDescription: activePersona.baseDescription, // Save base desc for context
                    timestamp: new Date().toISOString(),
                    versions: adVersions // Save all generated versions
                });

            } else {
                // This means the API returned text, but it couldn't be parsed into versions.
                throw new Error(chrome.i18n.getMessage('couldNotParseText'));
            }
        } else {
            // This means callOpenAI returned an empty/null string, or an error was already thrown by callOpenAI.
            // If callOpenAI itself threw an error (e.g. API key issue, network issue), it would be caught by the outer catch.
            // This 'else' specifically handles the case where callOpenAI "succeeded" but returned no usable text.
            throw new Error(chrome.i18n.getMessage('errorGeneratingText'));
        }
    } catch (error) {
        console.error("Error during ad generation:", error);
        // Use error.message if it's specific, otherwise use a generic message.
        // This helps preserve more specific error messages from callOpenAI (like API key errors).
        let displayErrorMessage = chrome.i18n.getMessage('errorGeneratingText'); // Default generic error
        if (error && error.message) {
            // Check if the error message is one of our known i18n keys or a specific API error format
            if (error.message.includes(chrome.i18n.getMessage('couldNotParseText')) ||
                error.message.includes(chrome.i18n.getMessage('errorApiKeyMissing')) ||
                error.message.startsWith("API Error")) {
                displayErrorMessage = error.message;
            } else if (error.message === chrome.i18n.getMessage('errorGeneratingText')) {
                 displayErrorMessage = error.message; // It's already the generic one
            }
            // Otherwise, stick with the default generic error to avoid showing overly technical details to the user.
        }

        if (dom.primaryTextField) dom.primaryTextField.innerText = displayErrorMessage;
        if (dom.headlineField) dom.headlineField.innerText = "";
        if (dom.descriptionField) dom.descriptionField.innerText = "";
        updateAngleAdsContainerPlaceholder(true, displayErrorMessage);
        updateTabPlaceholders(true, displayErrorMessage);
        alert(displayErrorMessage);
    }
}

function resetAdFields() {
    if (dom.inputContent) dom.inputContent.value = '';
    // dom.targetAudienceInput.value = ''; // Removed

    const willBeFilledText = chrome.i18n.getMessage('willBeFilledText');
    if (dom.primaryTextField) {
        dom.primaryTextField.innerText = willBeFilledText;
        delete dom.primaryTextField.dataset.originalContent;
    }
    if (dom.headlineField) {
        dom.headlineField.innerText = willBeFilledText;
        delete dom.headlineField.dataset.originalContent;
    }
    if (dom.descriptionField) {
        dom.descriptionField.innerText = willBeFilledText;
        delete dom.descriptionField.dataset.originalContent;
    }

    // Clear and hide tabs
    if (dom.multiVersionTabsContainer) dom.multiVersionTabsContainer.style.display = 'none';
    if (dom.primaryTextsTabContent) dom.primaryTextsTabContent.innerHTML = '';
    if (dom.headlinesTabContent) dom.headlinesTabContent.innerHTML = '';
    if (dom.descriptionsTabContent) dom.descriptionsTabContent.innerHTML = '';
    updateAngleAdsContainerPlaceholder(true); // Show placeholder after reset
    updateTabPlaceholders(true); // Reset tab placeholders

    // Clear relevant storage items
    const keysToRemove = [
        STORAGE_KEY_INPUT,
        // STORAGE_KEY_TARGET_AUDIENCE, // Removed
        STORAGE_KEY_PRIMARY,
        STORAGE_KEY_HEADLINE,
        STORAGE_KEY_DESCRIPTION,
        STORAGE_KEY_LAST_RAW_RESPONSE
        // Optionally keep STORAGE_KEY_COPYWRITER and STORAGE_KEY_ADDRESS_FORM
    ];
    chrome.storage.local.remove(keysToRemove, () => {
        console.log("Ad fields and related storage cleared.");
    });
    // Selections for copywriter, form of address, and active persona are intentionally kept.
    // If you want to reset them too, add their keys to `keysToRemove` and reset the select elements.
}


export function setupAdGenerationListeners() {
    if (dom.generateBtn) {
        dom.generateBtn.addEventListener('click', generateAdCopy);
    }
    if (dom.resetBtn) {
        dom.resetBtn.addEventListener('click', resetAdFields);
    }
    // Listeners for copy buttons are in copyToClipboard.js
    // Listeners for tab switching are in adDisplay.js
}
