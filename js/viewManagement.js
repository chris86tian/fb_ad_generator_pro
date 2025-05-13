import * as dom from './dom.js';
import { loadSettingsForOptionsPage } from './settings.js';
import { renderArchiveList } from './archive.js';
import { loadCurrentPersonaForEdit, clearPersonaCreationFields } from './persona.js';
import { renderPersonaList } from './personaManagement.js';
import { getSystemPrompt } from './prompt.js';
import { loadMainViewSelections, updateActivePersonaDisplay } from './mainViewPersistence.js';
import { generateHeaderHtml, addHeaderEventListeners } from './header.js'; // Import header functions

const views = {
    main: dom.mainView,
    options: dom.optionsView,
    info: dom.infoView,
    archive: dom.archiveView,
    persona: dom.personaView,
    personaListView: dom.personaListView
};

export function showView(viewName, params = {}) {
  console.log(`Attempting to show view: ${viewName} with params:`, params);
  Object.keys(views).forEach(key => {
    const viewElement = views[key];
    if (viewElement) {
        viewElement.style.display = 'none';
    } else {
        console.warn(`View element not found for key during hide phase: ${key}`);
    }
  });

  const targetViewElement = views[viewName];
  if (targetViewElement) {
      targetViewElement.style.display = 'block';

      // --- Dynamic Header Generation ---
      let titleKey = 'appName'; // Default title key
      let showBackButton = true;

      switch (viewName) {
          case 'main':
              titleKey = 'appName'; // Special key for main view title structure
              showBackButton = false;
              break;
          case 'options':
              titleKey = 'settingsTitle';
              break;
          case 'info':
              titleKey = 'infoTitle';
              break;
          case 'archive':
              titleKey = 'archiveViewTitle';
              break;
          case 'persona':
              titleKey = 'personaViewTitle';
              break;
          case 'personaListView':
              titleKey = 'personaListViewTitle';
              break;
      }

      const headerPlaceholder = targetViewElement.querySelector('.header-placeholder');
      if (headerPlaceholder) {
          headerPlaceholder.innerHTML = generateHeaderHtml(titleKey, showBackButton);
          const headerDiv = headerPlaceholder.querySelector('.header'); // Get the actual header div
          if (headerDiv) {
              addHeaderEventListeners(headerDiv);
          }
      }
      // --- End Dynamic Header Generation ---

  } else {
      console.error(`CRITICAL: Target view element NOT FOUND for key: ${viewName}`);
      return;
  }

  // View-specific logic after showing the view and rendering its header
  switch (viewName) {
      case 'options':
          loadSettingsForOptionsPage();
          break;
      case 'info':
          if (dom.systemPromptDisplay) {
            const currentCopywriter = dom.copywriterSelect ? dom.copywriterSelect.value : "Default";
            const currentAddressForm = dom.formOfAddressSelect ? dom.formOfAddressSelect.value : "Du";
            // TODO: Fetch active persona text for info view display.
            // This requires async operation, consider updating it after persona details are fetched.
            // For now, using a placeholder or a synchronous way to get a hint.
            updateActivePersonaDisplay().then(() => { // Ensure persona display is updated before getting text
                const activePersonaText = dom.activePersonaDisplay?.title || chrome.i18n.getMessage('noActivePersonaSelected');
                dom.systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm, activePersonaText);
            });
          }
          break;
      case 'archive':
          renderArchiveList();
          break;
      case 'persona':
          // loadCurrentPersonaForEdit handles clearing fields if personaIdToEdit is null/undefined
          loadCurrentPersonaForEdit(params.personaIdToEdit || null);
          break;
      case 'personaListView':
          renderPersonaList();
          break;
      case 'main':
          loadMainViewSelections(); // This also calls updateActivePersonaDisplay
          break;
  }
  console.log(`Finished showing view: ${viewName}`);
}

export function setupNavigationListeners() {
    console.log("Setting up NON-HEADER navigation listeners...");

    // Main View Content Nav (Buttons NOT in the header)
    // dom.viewArchiveBtn was removed from main view, so its listener is also removed.
    if (dom.changePersonaBtn) {
        dom.changePersonaBtn.addEventListener('click', () => showView('personaListView'));
    }

    // Listeners for buttons within specific views are typically handled in their respective modules
    // (e.g., personaManagement.js for createNewPersonaBtn, edit/delete buttons in persona list)
    // or initialized when those views are shown if they are static.

    console.log("Finished setting up NON-HEADER navigation listeners.");
}
