import * as dom from './dom.js';
import { STORAGE_KEY_PERSONA_LIST, STORAGE_KEY_ACTIVE_PERSONA_ID } from './storage.js';
import { showView } from './viewManagement.js';
import { clearPersonaCreationFields, loadCurrentPersonaForEdit } from './persona.js'; // Import for clearing/loading persona fields
import { updateActivePersonaDisplay } from './mainViewPersistence.js';


async function getPersonaList() {
    const result = await chrome.storage.local.get(STORAGE_KEY_PERSONA_LIST);
    return result[STORAGE_KEY_PERSONA_LIST] || [];
}

async function getActivePersonaId() {
    const result = await chrome.storage.local.get(STORAGE_KEY_ACTIVE_PERSONA_ID);
    return result[STORAGE_KEY_ACTIVE_PERSONA_ID] || null;
}

async function setActivePersonaId(personaId) {
    await chrome.storage.local.set({ [STORAGE_KEY_ACTIVE_PERSONA_ID]: personaId });
    console.log(`Active persona set to: ${personaId}`);
    await renderPersonaList(); // Re-render to show active state in list
    await updateActivePersonaDisplay(); // Update display on main page
}

async function deletePersona(personaId) {
    if (!confirm(chrome.i18n.getMessage('personaDeleteConfirm'))) {
        return;
    }
    try {
        let personaList = await getPersonaList();
        personaList = personaList.filter(p => p.id !== personaId);
        await chrome.storage.local.set({ [STORAGE_KEY_PERSONA_LIST]: personaList });

        const activeId = await getActivePersonaId();
        if (activeId === personaId) {
            await chrome.storage.local.remove(STORAGE_KEY_ACTIVE_PERSONA_ID);
        }

        console.log(`Persona ${personaId} deleted.`);
        await renderPersonaList();
        await updateActivePersonaDisplay(); // Update display on main page
    } catch (error) {
        console.error(`Error deleting persona ${personaId}:`, error);
        alert(chrome.i18n.getMessage('personaDeleteError', [error.message]));
    }
}

export async function renderPersonaList() {
    if (!dom.personaListContainer || !dom.emptyPersonaListMessage) return;

    const personaList = await getPersonaList();
    const activePersonaId = await getActivePersonaId();
    dom.personaListContainer.innerHTML = '';

    if (personaList.length === 0) {
        dom.emptyPersonaListMessage.style.display = 'block';
        dom.personaListContainer.style.display = 'none';
    } else {
        dom.emptyPersonaListMessage.style.display = 'none';
        dom.personaListContainer.style.display = 'block';

        personaList.forEach(persona => {
            const item = document.createElement('div');
            item.classList.add('persona-list-item');
            if (persona.id === activePersonaId) {
                item.classList.add('active');
            }
            item.dataset.personaId = persona.id;

            const details = document.createElement('div');
            details.classList.add('persona-list-item-details');

            const title = document.createElement('strong');
            title.textContent = persona.baseDescription || persona.generatedText.substring(0, 50) + '...' || `Persona ${persona.id.substring(0,8)}`;
            title.title = persona.baseDescription || persona.generatedText;

            const preview = document.createElement('div');
            preview.classList.add('persona-preview');
            preview.textContent = persona.generatedText.substring(0, 100) + '...';
            preview.title = persona.generatedText;

            details.appendChild(title);
            details.appendChild(preview);

            const actions = document.createElement('div');
            actions.classList.add('persona-list-item-actions');

            const selectBtn = document.createElement('button');
            selectBtn.classList.add('btn-success');
            selectBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${chrome.i18n.getMessage('personaSelectButton')}`;
            selectBtn.title = chrome.i18n.getMessage('personaSelectButtonTitle');
            selectBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setActivePersonaId(persona.id);
            });

            const editBtn = document.createElement('button');
            editBtn.classList.add('btn-secondary');
            editBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> ${chrome.i18n.getMessage('editButton')}`;
            editBtn.title = chrome.i18n.getMessage('personaEditButtonTitle');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadCurrentPersonaForEdit(persona.id); // Load data into personaView
                showView('persona'); // Navigate to personaView for editing
            });


            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('btn-danger');
            deleteBtn.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> ${chrome.i18n.getMessage('deleteButton')}`;
            deleteBtn.title = chrome.i18n.getMessage('personaDeleteButtonTitle');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePersona(persona.id);
            });

            actions.appendChild(selectBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            item.appendChild(details);
            item.appendChild(actions);

            dom.personaListContainer.appendChild(item);
        });
    }
}

export function setupPersonaManagementListeners() {
    // Button to navigate to the Create New Persona View (which is personaView)
    if (dom.createNewPersonaBtn) {
        dom.createNewPersonaBtn.addEventListener('click', () => {
            clearPersonaCreationFields(); // Clear fields in personaView before showing it
            showView('persona'); // 'persona' is the key for personaView
        });
    }

    // The back button for personaListView (backToMainBtnFromPersonaList) is handled in viewManagement.js
}
