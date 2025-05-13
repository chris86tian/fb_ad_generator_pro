import * as dom from './js/dom.js';
import { loadInitialLanguage, updateTabPlaceholders } from './js/localization.js'; // Removed updateAngleAdsContainerPlaceholder as it's in adDisplay
import { setupNavigationListeners, showView } from './js/viewManagement.js';
import { setupSettingsListeners } from './js/settings.js';
import { setupAdGenerationListeners } from './js/adGeneration.js';
import { setupArchiveListeners } from './js/archive.js'; // Removed loadFromArchive, renderArchiveList (called via showView)
import { setupPersonaListeners } from './js/persona.js'; // Removed loadCurrentPersonaForEdit (called via showView/listener)
import { setupPersonaManagementListeners } from './js/personaManagement.js'; // Removed renderPersonaList (called via showView)
import { setupCopyButtonListeners } from './js/copyToClipboard.js'; // Import setup function
import { loadMainViewSelections, setupMainViewListeners } from './js/mainViewPersistence.js';
// Removed parser import, it's used internally by adGeneration
import { updateAngleAdsContainerPlaceholder } from './js/adDisplay.js'; // Import necessary functions from adDisplay


// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM fully loaded and parsed.");
  // Setup listeners first
  setupNavigationListeners();
  setupSettingsListeners();
  setupAdGenerationListeners();
  setupArchiveListeners();
  setupPersonaListeners(); // Sets up listeners for the Persona Create/Edit view
  setupPersonaManagementListeners(); // Sets up listeners for the Persona List view
  setupCopyButtonListeners(); // Setup main copy buttons
  setupMainViewListeners();

  // Load initial data and state
  await loadInitialLanguage(); // Applies translations
  await loadMainViewSelections(); // Loads input, dropdowns, potentially last results

  // Show the main view initially
  showView('main');

  // Initial placeholder state for tabs/angle ads
  updateAngleAdsContainerPlaceholder(true); // Show placeholder initially
  updateTabPlaceholders(true); // Set initial tab placeholder text

  // Removed tab switching logic since tabs have been removed
  console.log("Initialization complete.");
});
