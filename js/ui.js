// Remove parseAdVersions, displayAdVersionsInTabs, createVersionItemElement, copyToClipboard
// Keep showView, switchTab (if used elsewhere, otherwise move switchTab to adDisplay.js)

import * as dom from './dom.js';
import { getSystemPrompt } from './prompt.js';
import { loadSettingsForOptionsPage } from './storage.js';
import { renderArchiveList } from './archive.js';
import { getActivePersonaDetails } from './adGeneration.js'; // Import helper if needed here, or keep in adGeneration

export const views = {
    main: dom.mainView,
    options: dom.optionsView,
    info: dom.infoView,
    archive: dom.archiveView,
    personaView: dom.personaView, // Add persona create/edit view
    personaListView: dom.personaListView // Add persona list view
};


export function showView(viewName) {
    console.log(`Switching to view: ${viewName}`); // Log view switching
    Object.keys(views).forEach(key => {
        if (views[key]) {
            views[key].style.display = (key === viewName) ? 'block' : 'none';
        } else {
            console.warn(`View element not found for key: ${key}`);
        }
    });

    // --- Header Button Visibility ---
    const backButtonTitle = chrome.i18n.getMessage('backButton');

    // Configure Back Buttons
    const backButtons = [
        { btn: dom.backToMainBtnFromOptions, view: 'options' },
        { btn: dom.backToMainBtnFromInfo, view: 'info' },
        { btn: dom.backToMainBtnFromArchive, view: 'archive' },
        { btn: dom.backToMainBtnFromPersona, view: 'personaView' }, // Back from Persona Create/Edit
        { btn: dom.backToPersonaViewBtn, view: 'personaListView' } // Back from Persona List
    ];

    backButtons.forEach(item => {
        if (item.btn) {
            item.btn.title = backButtonTitle;
            item.btn.style.display = (viewName === item.view) ? 'inline-block' : 'none';
        }
    });

    // Configure Main Header Controls (Info, Options, Archive, Persona List buttons)
    const mainHeaderControls = document.querySelector('#mainView .header-controls');
    if (mainHeaderControls) {
        mainHeaderControls.style.display = (viewName === 'main') ? 'flex' : 'none';
    }

    // --- View Specific Logic ---
    if (viewName === 'info' && dom.systemPromptDisplay) {
        // Update system prompt display based on current selections + active persona
        (async () => { // Use async IIFE to await persona details
            const currentCopywriter = dom.copywriterSelect ? dom.copywriterSelect.value : "Default";
            const currentAddressForm = dom.formOfAddressSelect ? dom.formOfAddressSelect.value : "Du";
            const activePersona = await getActivePersonaDetails(); // Fetch active persona
            const personaText = activePersona ? activePersona.generatedText : ""; // Get its text
            dom.systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm, personaText);
        })();
    }
    if (viewName === 'options') {
        loadSettingsForOptionsPage();
    }
    if (viewName === 'archive') {
        renderArchiveList();
    }
    // Add logic for persona views if needed when they are shown
    if (viewName === 'personaView') {
        // Potentially load data if editing an existing persona
        // This is handled by setupPersonaListeners calling loadCurrentPersonaForEdit
        console.log("Persona Create/Edit view shown.");
    }
    if (viewName === 'personaListView') {
        // Render the list when the view is shown
        const { renderPersonaList } = await import('./personaManagement.js'); // Dynamic import if needed
        renderPersonaList();
        console.log("Persona List view shown.");
    }
}

// Note: switchTab function is now moved to adDisplay.js
// Note: copyToClipboard function is now moved to copyToClipboard.js
