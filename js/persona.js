import * as dom from './dom.js';
import { callOpenAI } from './api.js';
import { getApiKey, getSelectedModel } from './settings.js';
import { STORAGE_KEY_PERSONA_LIST, STORAGE_KEY_ACTIVE_PERSONA_ID } from './storage.js'; // Added ACTIVE_PERSONA_ID
import { showView } from './viewManagement.js';
import { updateActivePersonaDisplay } from './mainViewPersistence.js'; // To update main view display

// Helper to generate unique IDs
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Function to clear fields in the persona creation/edit view
export function clearPersonaCreationFields() {
    if(dom.personaBaseDescription) dom.personaBaseDescription.value = '';
    if(dom.generatedPersonaText) dom.generatedPersonaText.value = '';
    if(dom.personaLoadingErrorPlaceholder) dom.personaLoadingErrorPlaceholder.innerHTML = '';
    if(dom.saveCurrentPersonaBtn) {
        dom.saveCurrentPersonaBtn.style.display = 'none';
        dom.saveCurrentPersonaBtn.dataset.editingPersonaId = ''; // Clear editing ID
        // Ensure button text is for "Add" if it was changed for "Update"
        const buttonTextSpan = dom.saveCurrentPersonaBtn.querySelector('span');
        if (buttonTextSpan) {
            buttonTextSpan.textContent = chrome.i18n.getMessage('savePersonaToListButton');
        }
    }
}


async function generatePersonaText(baseDescription) {
    if (!dom.generatedPersonaText || !dom.personaLoadingErrorPlaceholder || !dom.saveCurrentPersonaBtn) return;

    dom.personaLoadingErrorPlaceholder.innerHTML = `<p class="loading-placeholder">${chrome.i18n.getMessage('personaGeneratingPlaceholder')}</p>`;
    dom.generatedPersonaText.value = '';
    dom.saveCurrentPersonaBtn.style.display = 'none';

    try {
        const apiKey = await getApiKey();
        const model = await getSelectedModel();

        if (!apiKey) {
            throw new Error(chrome.i18n.getMessage('errorApiKeyMissing'));
        }

        // The systemContent for persona generation is now defined in js/prompt.js
        // For this specific call, we use a more direct prompt if getPersonaSystemPrompt is not suitable.
        // However, the existing getPersonaSystemPrompt seems fine.
        // For persona generation, the system prompt is simpler and defined in js/prompt.js getPersonaSystemPrompt
        // For this specific call, we use a more direct prompt.
        const systemContentForPersona = `Du bist ein Experte für Marketing-Personas. Erstelle eine detaillierte Persona basierend auf der folgenden Beschreibung. Die Persona sollte Empathie-fördernd sein und klare Einblicke in die Motivationen, Ziele, Herausforderungen und den bevorzugten Kommunikationsstil der Zielperson geben. Formatiere die Ausgabe als gut lesbaren, zusammenhängenden Text, der direkt in Marketingmaterialien verwendet werden kann. Gib NUR die Persona-Beschreibung aus, keinen einleitenden oder abschließenden Text.`;
        const userContent = baseDescription;

        // callOpenAI now directly returns the content string or throws an error.
        const personaTextResponse = await callOpenAI(apiKey, model, systemContentForPersona, userContent);

        if (personaTextResponse && personaTextResponse.trim() !== '') {
            dom.generatedPersonaText.value = personaTextResponse.trim();
            dom.personaLoadingErrorPlaceholder.innerHTML = '';
            dom.saveCurrentPersonaBtn.style.display = 'inline-flex';
        } else {
            // This case should ideally be caught by callOpenAI if the response is truly empty or problematic.
            // If callOpenAI returns an empty string but doesn't throw, this will catch it.
            throw new Error(chrome.i18n.getMessage('errorNoPersonaGenerated'));
        }
    } catch (error) {
        console.error("Error generating persona:", error);
        // Ensure the error message is specific. If error.message already contains the i18n string, don't double wrap.
        const errorMessage = error.message.includes(chrome.i18n.getMessage('errorNoPersonaGenerated')) || error.message.includes(chrome.i18n.getMessage('errorApiKeyMissing'))
            ? error.message
            : chrome.i18n.getMessage('personaGenerationError', [error.message]);
        dom.personaLoadingErrorPlaceholder.innerHTML = `<p class="error-message">${errorMessage}</p>`;
        dom.generatedPersonaText.value = '';
        dom.saveCurrentPersonaBtn.style.display = 'none';
    }
}

async function saveCurrentPersonaToList() {
    if (!dom.generatedPersonaText || !dom.personaBaseDescription || !dom.saveCurrentPersonaBtn) return;

    const generatedText = dom.generatedPersonaText.value.trim();
    const baseDescription = dom.personaBaseDescription.value.trim();
    const editingPersonaId = dom.saveCurrentPersonaBtn.dataset.editingPersonaId;


    if (!generatedText) {
        alert(chrome.i18n.getMessage('personaSaveErrorNoText'));
        return;
    }
    // Base description is important for new personas, but for edits, it might be acceptable if only generatedText is changed.
    // However, it's good practice to have it.
    if (!baseDescription && !editingPersonaId) {
        alert(chrome.i18n.getMessage('personaSaveErrorNoBaseDescription'));
        return;
    }


    try {
        let personaList = (await chrome.storage.local.get(STORAGE_KEY_PERSONA_LIST))[STORAGE_KEY_PERSONA_LIST] || [];
        let newPersonaId;
        let isUpdate = false;

        if (editingPersonaId) {
            const personaIndex = personaList.findIndex(p => p.id === editingPersonaId);
            if (personaIndex > -1) {
                personaList[personaIndex].generatedText = generatedText;
                if (dom.personaBaseDescription.value.trim() !== personaList[personaIndex].baseDescription) {
                     personaList[personaIndex].baseDescription = dom.personaBaseDescription.value.trim();
                }
                newPersonaId = editingPersonaId;
                isUpdate = true;
                console.log(`Persona ${editingPersonaId} updated.`);
            } else {
                console.error(`Persona with ID ${editingPersonaId} not found for update.`);
                alert(chrome.i18n.getMessage('personaUpdateErrorNotFound'));
                return;
            }
        } else {
            newPersonaId = generateUniqueId();
            const newPersona = {
                id: newPersonaId,
                baseDescription: baseDescription,
                generatedText: generatedText,
                createdAt: new Date().toISOString()
            };
            personaList.push(newPersona);
            console.log(`New persona ${newPersonaId} added.`);
        }


        await chrome.storage.local.set({ [STORAGE_KEY_PERSONA_LIST]: personaList });
        await chrome.storage.local.set({ [STORAGE_KEY_ACTIVE_PERSONA_ID]: newPersonaId });
        await updateActivePersonaDisplay();

        alert(chrome.i18n.getMessage(isUpdate ? 'personaUpdatedSuccess' : 'personaSavedSuccess'));
        clearPersonaCreationFields();
        showView('personaListView');
    } catch (error) {
        console.error("Error saving persona:", error);
        alert(chrome.i18n.getMessage('personaSaveErrorGeneral', [error.message]));
    }
}


export async function loadCurrentPersonaForEdit(personaIdToEdit) {
    clearPersonaCreationFields(); // Clears fields and resets save button for "Add"

    if (!personaIdToEdit) {
        console.log("No persona ID provided, preparing for new persona creation.");
        // Button text is reset in clearPersonaCreationFields
        return;
    }

    console.log(`Attempting to load persona ${personaIdToEdit} for editing.`);
    try {
        const personaList = (await chrome.storage.local.get(STORAGE_KEY_PERSONA_LIST))[STORAGE_KEY_PERSONA_LIST] || [];
        const persona = personaList.find(p => p.id === personaIdToEdit);

        if (persona && dom.personaBaseDescription && dom.generatedPersonaText && dom.saveCurrentPersonaBtn) {
            dom.personaBaseDescription.value = persona.baseDescription || '';
            dom.generatedPersonaText.value = persona.generatedText || '';
            dom.saveCurrentPersonaBtn.style.display = 'inline-flex';
            dom.saveCurrentPersonaBtn.dataset.editingPersonaId = persona.id;
            const buttonTextSpan = dom.saveCurrentPersonaBtn.querySelector('span');
            if (buttonTextSpan) { // Change button text to "Update Persona"
                buttonTextSpan.textContent = chrome.i18n.getMessage('updatePersonaButton'); // Ensure this i18n key exists
            }
            console.log(`Persona ${personaIdToEdit} loaded into form for editing.`);
        } else {
            console.error(`Persona ${personaIdToEdit} not found or DOM elements missing.`);
            alert(chrome.i18n.getMessage('personaLoadForEditError'));
            // clearPersonaCreationFields(); // Already called at the beginning
        }
    } catch (error) {
        console.error(`Error loading persona ${personaIdToEdit} for editing:`, error);
        alert(chrome.i18n.getMessage('personaLoadForEditErrorGeneral', [error.message]));
        // clearPersonaCreationFields(); // Already called at the beginning
    }
}


export function setupPersonaListeners() {
    if (dom.generatePersonaBtn) {
        dom.generatePersonaBtn.addEventListener('click', () => {
            if (dom.personaBaseDescription) {
                const baseDesc = dom.personaBaseDescription.value.trim();
                if (baseDesc) {
                    generatePersonaText(baseDesc);
                } else {
                    alert(chrome.i18n.getMessage('personaBaseDescriptionMissing'));
                }
            }
        });
    }

    if (dom.saveCurrentPersonaBtn) {
        dom.saveCurrentPersonaBtn.addEventListener('click', saveCurrentPersonaToList);
    }
}
