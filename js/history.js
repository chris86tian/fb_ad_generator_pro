// Imports seem correct based on available context
import { STORAGE_KEY_HISTORY } from './storage.js';

export async function saveToHistory(rawResponse, model, type) {
    const historyEntry = {
        timestamp: new Date().toISOString(),
        rawResponse: rawResponse,
        model: model,
        type: type // e.g., "3_versions", "persona"
    };

    const result = await chrome.storage.local.get(STORAGE_KEY_HISTORY);
    const history = result[STORAGE_KEY_HISTORY] || [];

    // Add new entry to the beginning
    history.unshift(historyEntry);

    // Keep history size manageable (e.g., last 50 entries)
    const maxHistorySize = 50;
    if (history.length > maxHistorySize) {
        history.splice(maxHistorySize);
    }

    await chrome.storage.local.set({ [STORAGE_KEY_HISTORY]: history });
}

export async function getHistory() {
    const result = await chrome.storage.local.get(STORAGE_KEY_HISTORY);
    return result[STORAGE_KEY_HISTORY] || [];
}

export async function clearHistory() {
    await chrome.storage.local.remove(STORAGE_KEY_HISTORY);
}
