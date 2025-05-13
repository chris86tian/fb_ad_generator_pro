// Remove parseAdVersions, displayAdVersionsInTabs, createVersionItemElement, copyToClipboard
// Keep showView

import * as dom from './dom.js';
import { getSystemPrompt } from './prompt.js';
import { loadSettingsForOptionsPage } from './storage.js';
import { renderArchiveList } from './archive.js';
import { getActivePersonaDetails } from './adGeneration.js';

export const views = {
    main: dom.mainView,
    options: dom.optionsView,
    info: dom.infoView,
    archive: dom.archiveView,
    personaView: dom.personaView,
    personaListView: dom.personaListView
};


export function showView(viewName) {
    console.log(`Switching to view: ${viewName}`);
    Object.keys(views).forEach(key => {
        if (views[key]) {
            views[key].style.display = (key === viewName) ? 'block' : 'none';
        } else {
            console.warn(`View element not found for key: ${key}`);
        }
    });

    const backButtonTitle = chrome.i18n.getMessage('backButton');

    const backButtons = [
        { btn: dom.backToMainBtnFromOptions, view: 'options' },
        { btn: dom.backToMainBtnFromInfo, view: 'info' },
        { btn: dom.backToMainBtnFromArchive, view: 'archive' },
        { btn: dom.backToMainBtnFromPersona, view: 'personaView' },
        { btn: dom.backToPersonaViewBtn, view: 'personaListView' }
    ];

    backButtons.forEach(item => {
        if (item.btn) {
            item.btn.title = backButtonTitle;
            item.btn.style.display = (viewName === item.view) ? 'inline-block' : 'none';
        }
    });

    const mainHeaderControls = document.querySelector('#mainView .header-controls');
    if (mainHeaderControls) {
        mainHeaderControls.style.display = (viewName === 'main') ? 'flex' : 'none';
    }

    if (viewName === 'info' && dom.systemPromptDisplay) {
        (async () => {
            const currentCopywriter = dom.copywriterSelect ? dom.copywriterSelect.value : "Default";
            const currentAddressForm = dom.formOfAddressSelect ? dom.formOfAddressSelect.value : "Du";
            const activePersona = await getActivePersonaDetails();
            const personaText = activePersona ? activePersona.generatedText : "";
            dom.systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm, personaText);
        })();
    }
    if (viewName === 'options') {
        loadSettingsForOptionsPage();
    }
    if (viewName === 'archive') {
        renderArchiveList();
    }
    if (viewName === 'personaView') {
        console.log("Persona Create/Edit view shown.");
    }
    if (viewName === 'personaListView') {
        // Dynamic import for renderPersonaList to avoid circular dependencies if any, or just direct call
        import('./personaManagement.js').then(personaManagement => {
            personaManagement.renderPersonaList();
        });
        console.log("Persona List view shown.");
    }
}

// switchTab function removed as it's no longer needed.
