import * as dom from './dom.js';
import { showView } from './viewManagement.js';
// Corrected import: STORAGE_KEY_ARCHIVE (Singular) instead of STORAGE_KEY_ARCHIVES
import { STORAGE_KEY_ARCHIVE, STORAGE_KEY_INPUT, STORAGE_KEY_TARGET_AUDIENCE, STORAGE_KEY_PRIMARY, STORAGE_KEY_HEADLINE, STORAGE_KEY_DESCRIPTION, STORAGE_KEY_COPYWRITER, STORAGE_KEY_ADDRESS_FORM, STORAGE_KEY_LAST_RAW_RESPONSE, STORAGE_KEY_CURRENT_PERSONA } from './storage.js';
import { displayAdVersionsInTabs, loadAndDisplayAdsFromStorage } from './adDisplay.js'; // Removed displayAngleAds
import { parseAdVersions } from './parser.js'; // Removed parseSingleAdResponse
// Removed import of renderPersonaFields as it no longer exists
// *** WICHTIG: Die folgende Zeile wurde entfernt, da sie den Fehler verursacht hat ***
// import { loadCurrentPersona } from './persona.js';
import { applyLocalization } from './localization.js';

let archives = [];

async function loadArchivesFromStorage() {
  // Use the corrected constant name
  const result = await chrome.storage.local.get(STORAGE_KEY_ARCHIVE);
  archives = result[STORAGE_KEY_ARCHIVE] || [];
}

async function saveArchivesToStorage() {
  // Use the corrected constant name
  await chrome.storage.local.set({ [STORAGE_KEY_ARCHIVE]: archives });
}

export function renderArchiveList() {
  if (!dom.archiveListContainer || !dom.emptyArchiveMessage) return;

  dom.archiveListContainer.innerHTML = ''; // Clear existing list

  if (archives.length === 0) {
    dom.emptyArchiveMessage.style.display = 'block';
    dom.archiveListContainer.style.display = 'none';
  } else {
    dom.emptyArchiveMessage.style.display = 'none';
    dom.archiveListContainer.style.display = 'block';
    // Sort archives by timestamp descending (newest first)
    archives.sort((a, b) => b.timestamp - a.timestamp);
    archives.forEach((item, index) => {
      const archiveItem = createArchiveElement(item, index);
      dom.archiveListContainer.appendChild(archiveItem);
    });
    applyLocalization(dom.archiveListContainer); // Apply localization to newly added elements
  }
}

function createArchiveElement(item, index) {
  const div = document.createElement('div');
  div.className = 'archive-item';
  div.dataset.index = index; // Use index for identification

  const date = new Date(item.timestamp).toLocaleString();
  const inputPreview = item.inputContent ? item.inputContent.substring(0, 50) + (item.inputContent.length > 50 ? '...' : '') : 'N/A';
  // Display base description if persona object exists, otherwise target audience, otherwise 'Keine'
  const personaPreview = item.persona?.baseDescription ? item.persona.baseDescription : (item.targetAudience || 'Keine');

  div.innerHTML = `
    <div class="archive-item-details">
      <strong>${chrome.i18n.getMessage('archiveItemDateLabel') || 'Saved:'}</strong> <span class="archive-data">${date}</span>
    </div>
    <div class="archive-item-details">
      <strong>${chrome.i18n.getMessage('archiveItemInputLabel') || 'Input:'}</strong> <span class="archive-data">${inputPreview}</span>
    </div>
     <div class="archive-item-details">
      <strong>${chrome.i18n.getMessage('archiveItemPersonaLabel') || 'Persona:'}</strong> <span class="archive-data">${personaPreview}</span>
    </div>
    <div class="archive-item-actions">
      <button class="btn-secondary load-archive-btn" data-i18n-key="loadButton">Load</button>
      <button class="btn-danger delete-archive-btn" data-i18n-key="deleteButton">Delete</button>
    </div>
  `;
  return div;
}

export async function saveToArchive() {
    // Check if essential DOM elements exist
    if (!dom.inputContentField || !dom.copywriterSelect || !dom.formOfAddressSelect) {
        console.error("Required DOM elements for saving to archive are missing.");
        alert(chrome.i18n.getMessage('archiveSaveErrorMissingElements') || "Error: Could not find all required fields to save.");
        return;
    }

    const inputContent = dom.inputContentField.value;
    const copywriter = dom.copywriterSelect.value;
    const formOfAddress = dom.formOfAddressSelect.value;

    // Get current ad versions from storage (raw response) and active persona ID
    const result = await chrome.storage.local.get([
        STORAGE_KEY_LAST_RAW_RESPONSE,
        STORAGE_KEY_ACTIVE_PERSONA_ID // Get the ID of the active persona
    ]);
    const rawResponse3Versions = result[STORAGE_KEY_LAST_RAW_RESPONSE] || null;
    const activePersonaId = result[STORAGE_KEY_ACTIVE_PERSONA_ID] || null;

    let activePersonaData = null;
    if (activePersonaId) {
        // If there's an active persona ID, load its data from the list
        const personaListResult = await chrome.storage.local.get(STORAGE_KEY_PERSONA_LIST);
        const personaList = personaListResult[STORAGE_KEY_PERSONA_LIST] || [];
        activePersonaData = personaList.find(p => p.id === activePersonaId) || null;
    }

    // Get V1 text directly from the editable fields as they might have been changed
    const primaryTextV1 = dom.primaryTextField ? dom.primaryTextField.innerText : '';
    const headlineV1 = dom.headlineField ? dom.headlineField.innerText : '';
    const descriptionV1 = dom.descriptionField ? dom.descriptionField.innerText : '';

    const archiveEntry = {
        timestamp: Date.now(),
        inputContent,
        copywriter,
        formOfAddress,
        // targetAudience is no longer directly saved from a field here
        persona: activePersonaData, // Save the full data of the *active* persona at the time of saving
        rawResponse3Versions, // Save the raw response for the 3 versions
        editedV1: { // Save the potentially edited V1 texts
            primaryText: primaryTextV1,
            headline: headlineV1,
            description: descriptionV1
        }
    };

    archives.push(archiveEntry);
    await saveArchivesToStorage();
    renderArchiveList(); // Update the list display
    alert(chrome.i18n.getMessage('archiveSaveSuccessMessage') || 'Ad copy saved to archive!');
}


export async function loadFromArchive(index) {
    if (index < 0 || index >= archives.length) {
        console.error("Invalid archive index:", index);
        alert(chrome.i18n.getMessage('archiveLoadErrorMessage') || 'Error loading from archive.');
        return;
    }

    const item = archives[index];

    // Restore main view fields
    if (dom.inputContentField) dom.inputContentField.value = item.inputContent || '';
    if (dom.copywriterSelect) dom.copywriterSelect.value = item.copywriter || 'Default';
    if (dom.formOfAddressSelect) dom.formOfAddressSelect.value = item.formOfAddress || 'Du';
    // Target audience input no longer exists directly, it's part of the persona now.
    // We will set the active persona based on the loaded item.

    // Restore potentially edited V1 fields first
    if (dom.primaryTextField) dom.primaryTextField.innerText = item.editedV1?.primaryText || '';
    if (dom.headlineField) dom.headlineField.innerText = item.editedV1?.headline || '';
    if (dom.descriptionField) dom.descriptionField.innerText = item.editedV1?.description || '';

    // --- Handle Loaded Persona ---
    // 1. Set the loaded persona (if any) as the *active* persona in storage.
    // 2. Update the display in the main view.
    const loadedPersona = item.persona || null;
    const activePersonaIdToSet = loadedPersona ? loadedPersona.id : null;

    await chrome.storage.local.set({
        [STORAGE_KEY_ACTIVE_PERSONA_ID]: activePersonaIdToSet
        // We don't store STORAGE_KEY_CURRENT_PERSONA anymore in this flow
    });

    // Update the active persona display in the main view immediately
    const { updateActivePersonaDisplay } = await import('./mainViewPersistence.js'); // Dynamically import
    await updateActivePersonaDisplay(); // This function now reads STORAGE_KEY_ACTIVE_PERSONA_ID

    // Save restored data to local storage to persist it (excluding persona which is handled by active ID)
    await chrome.storage.local.set({
        [STORAGE_KEY_INPUT]: item.inputContent || '',
        [STORAGE_KEY_COPYWRITER]: item.copywriter || 'Default',
        [STORAGE_KEY_ADDRESS_FORM]: item.formOfAddress || 'Du',
        // [STORAGE_KEY_TARGET_AUDIENCE]: item.targetAudience || '', // Removed
        [STORAGE_KEY_PRIMARY]: item.editedV1?.primaryText || '',
        [STORAGE_KEY_HEADLINE]: item.editedV1?.headline || '',
        [STORAGE_KEY_DESCRIPTION]: item.editedV1?.description || '',
        [STORAGE_KEY_LAST_RAW_RESPONSE]: item.rawResponse3Versions || null
    });

    // Reload and display ads from the restored storage state
    // This will handle parsing the rawResponse3Versions and displaying V1 + tabs
    await loadAndDisplayAdsFromStorage();


    // --- Update Persona View Fields (if the view is ever opened later) ---
    // This ensures that if the user navigates to the persona edit view *after* loading
    // from archive, the fields reflect the loaded persona's details.
    const personaBaseDescField = document.getElementById('personaBaseDescription');
    if (personaBaseDescField) {
        personaBaseDescField.value = loadedPersona?.baseDescription || '';
    }
    const generatedPersonaTextField = document.getElementById('generatedPersonaText');
     if (generatedPersonaTextField) {
        generatedPersonaTextField.value = loadedPersona?.generatedText || '';
        // Show/hide save button based on whether text exists
        const saveBtn = document.getElementById('saveCurrentPersonaBtn');
        if (saveBtn) {
            saveBtn.style.display = loadedPersona?.generatedText ? 'inline-flex' : 'none';
        }
    }

    showView('main'); // Switch back to the main view
    alert(chrome.i18n.getMessage('archiveLoadSuccessMessage') || 'Ad copy loaded successfully!');
}


async function deleteFromArchive(index) {
  if (index < 0 || index >= archives.length) {
    console.error("Invalid archive index for deletion:", index);
    return;
  }
  if (confirm(chrome.i18n.getMessage('archiveDeleteConfirmation') || 'Are you sure you want to delete this archived item?')) {
    archives.splice(index, 1); // Remove the item from the array
    await saveArchivesToStorage(); // Update storage
    renderArchiveList(); // Re-render the list
    alert(chrome.i18n.getMessage('archiveDeleteSuccessMessage') || 'Archived item deleted.');
  }
}

export function setupArchiveListeners() {
  // Load archives when the popup opens or when needed
  loadArchivesFromStorage().then(renderArchiveList); // Load and render initially

  if (dom.saveToArchiveBtn) {
    dom.saveToArchiveBtn.addEventListener('click', saveToArchive);
  }

  if (dom.viewArchiveBtn) {
    dom.viewArchiveBtn.addEventListener('click', () => {
      renderArchiveList(); // Re-render just before showing
      showView('archive');
    });
  }

  // Use event delegation for load/delete buttons inside the list container
  if (dom.archiveListContainer) {
    dom.archiveListContainer.addEventListener('click', async (event) => { // Make async for await inside
      const target = event.target;
      const archiveItem = target.closest('.archive-item');
      if (!archiveItem) return;

      const index = parseInt(archiveItem.dataset.index, 10);

      if (target.classList.contains('load-archive-btn')) {
       await loadFromArchive(index); // await the async function
      } else if (target.classList.contains('delete-archive-btn')) {
       await deleteFromArchive(index); // await the async function
      }
    });
  }
}
