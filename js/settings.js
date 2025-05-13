import * as dom from './dom.js';
import { showView } from './viewManagement.js'; // Assuming showView is in viewManagement.js
import { STORAGE_KEY_API_KEY, STORAGE_KEY_MODEL } from './storage.js';

export async function loadSettingsForOptionsPage() {
  const result = await chrome.storage.local.get([STORAGE_KEY_API_KEY, STORAGE_KEY_MODEL]);
  if (dom.apiKeyInput) dom.apiKeyInput.value = result[STORAGE_KEY_API_KEY] || '';
  if (dom.modelSelect) dom.modelSelect.value = result[STORAGE_KEY_MODEL] || 'gpt-4o';
}

export function setupSettingsListeners() {
  if (dom.saveSettingsBtn) {
    dom.saveSettingsBtn.addEventListener('click', async () => {
      const apiKey = dom.apiKeyInput ? dom.apiKeyInput.value : '';
      const selectedModel = dom.modelSelect ? dom.modelSelect.value : 'gpt-4o';
      if (apiKey && apiKey.trim() !== "") {
        await chrome.storage.local.set({ [STORAGE_KEY_API_KEY]: apiKey });
      } else {
        await chrome.storage.local.remove(STORAGE_KEY_API_KEY);
        if (dom.apiKeyInput) dom.apiKeyInput.value = '';
      }
      await chrome.storage.local.set({ [STORAGE_KEY_MODEL]: selectedModel });
      alert(chrome.i18n.getMessage('settingsSavedAlert'));
      showView('main');
    });
  }
}

export async function getApiKey() {
  const result = await chrome.storage.local.get(STORAGE_KEY_API_KEY);
  return result[STORAGE_KEY_API_KEY];
}

export async function getSelectedModel() {
  const result = await chrome.storage.local.get(STORAGE_KEY_MODEL);
  return result[STORAGE_KEY_MODEL] || 'gpt-4o';
}
