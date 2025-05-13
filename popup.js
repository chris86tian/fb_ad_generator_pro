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
import { switchTab, updateAngleAdsContainerPlaceholder } from './js/adDisplay.js'; // Import necessary functions from adDisplay


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

  // Ensure a tab is active if tabs happen to be visible on load (e.g., from saved state)
  // This logic might need adjustment based on how state is restored.
  // It's generally safer to activate the tab *after* content is loaded into it.
  // The logic inside displayAdVersionsInTabs now handles activating the first tab.
  // We might still need this if restoring state *shows* the tabs without running generation.
  if (dom.tabLinks && dom.tabLinks.length > 0 && dom.multiVersionTabsContainer && dom.multiVersionTabsContainer.style.display !== 'none') {
      console.log("Tabs container visible on load, ensuring a tab is active.");
      const activeTab = document.querySelector('.tab-navigation .tab-link.active');
      if (!activeTab && dom.tabLinks[0]) {
          switchTab(dom.tabLinks[0]); // Activate first tab if none are active
      } else if (activeTab) {
          // If a tab is already active (e.g. from restored state), ensure its content is shown
          switchTab(activeTab);
      }
  } else {
      console.log("Tabs container not visible on load or no tab links found.");
  }
  console.log("Initialization complete.");
});
