import * as dom from './dom.js';
import { getSystemPrompt } from './prompt.js';
import { renderArchiveList } from './archive.js';

export let currentLanguage = 'de'; // Default language

export async function applyLocalization(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n-key]').forEach(el => {
    const key = el.dataset.i18nKey;
    const message = chrome.i18n.getMessage(key);
    if (message) {
      el.textContent = message;
    }
  });
  document.querySelectorAll('[data-i18n-html-key]').forEach(el => {
      const key = el.dataset.i18nHtmlKey;
      const message = chrome.i18n.getMessage(key);
      if (message) {
          el.innerHTML = message;
      }
  });
  document.querySelectorAll('[data-i18n-placeholder-key]').forEach(el => {
    const key = el.dataset.i18nPlaceholderKey;
    const message = chrome.i18n.getMessage(key);
    if (message) {
      el.placeholder = message;
    }
  });
  document.querySelectorAll('[title^="__MSG_"]').forEach(el => {
      const key = el.title.replace("__MSG_", "").replace("__", "");
      const message = chrome.i18n.getMessage(key);
      if (message) {
          el.title = message;
      }
  });

  updateDynamicPlaceholders();
  updateCopyButtonTitles();
  updateTabPlaceholders(true);

  // Safely access angleAdsContainer
  if (dom.angleAdsContainer) {
      // Check if it contains the 'generating' message before overwriting
      const generatingMsg = chrome.i18n.getMessage('generatingText');
      if (!dom.angleAdsContainer.innerHTML.includes(generatingMsg)) {
          updateAngleAdsContainerPlaceholder(true);
      }
  }


  if (dom.infoView && dom.infoView.style.display === 'block' && dom.systemPromptDisplay) {
    const currentCopywriter = dom.copywriterSelect ? dom.copywriterSelect.value : "Default";
    const currentAddressForm = dom.formOfAddressSelect ? dom.formOfAddressSelect.value : "Du";
    const currentTargetAudience = dom.targetAudienceInput ? dom.targetAudienceInput.value : "";
    dom.systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm, currentTargetAudience);
  }
  if (dom.archiveView && dom.archiveView.style.display === 'block') {
      renderArchiveList(); // This function will need access to currentLanguage
  }
   if (dom.personaView && dom.personaView.style.display === 'block') {
        if (dom.personaPlaceholderMessage && dom.personaPlaceholderMessage.style.display !== 'none') {
            dom.personaPlaceholderMessage.textContent = chrome.i18n.getMessage('personaPlaceholderMessageText');
        }
        // Re-render persona fields if visible to update labels
        // This part might need adjustment depending on where getCurrentPersonaDataFromDOM and renderPersonaFields are moved
        // For now, assuming they are accessible or will be imported
        // const currentPersonaData = getCurrentPersonaDataFromDOM(); // Get data from DOM
        // if (Object.keys(currentPersonaData).length > 1 || dom.personaBaseDescription.value.trim()) { // More than just baseDescription or baseDesc has value
        //      renderPersonaFields(currentPersonaData, true); // Force label update
        // }
    }
}

export async function loadInitialLanguage() {
  applyLocalization('de');
}

export function updateDynamicPlaceholders() {
  const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
  // Only update if the current text is one of the old placeholders or empty
  const oldPlaceholders = ["Will be filled...", "Wird gefüllt...", ""];
  if (dom.primaryTextField && oldPlaceholders.includes(dom.primaryTextField.innerText)) dom.primaryTextField.innerText = willBeFilledMsg;
  if (dom.headlineField && oldPlaceholders.includes(dom.headlineField.innerText)) dom.headlineField.innerText = willBeFilledMsg;
  if (dom.descriptionField && oldPlaceholders.includes(dom.descriptionField.innerText)) dom.descriptionField.innerText = willBeFilledMsg;
}

export function updateCopyButtonTitles() {
  const primaryTextTitle = chrome.i18n.getMessage('primaryTextV1Title');
  const headlineTitle = chrome.i18n.getMessage('headlineV1Title');
  const descriptionTitle = chrome.i18n.getMessage('descriptionV1Title');

  if (dom.copyPrimaryTextBtn) dom.copyPrimaryTextBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [primaryTextTitle]);
  if (dom.copyHeadlineBtn) dom.copyHeadlineBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [headlineTitle]);
  if (dom.copyDescriptionBtn) dom.copyDescriptionBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [descriptionTitle]);
}

export function updateTabPlaceholders(forceUpdate = false) {
  const messageKey = 'tabGenerateAdCopyMessage';
  const message = chrome.i18n.getMessage(messageKey);
  if (dom.tabContents) {
      Object.values(dom.tabContents).forEach(tc => {
          if (tc) { // Check if tab content element exists
              // Check if the current content is one of the old placeholders or empty
              const currentContent = tc.innerHTML.trim();
              const oldPlaceholders = ["versions here", "Versionen hier", "Generate ad copy to see versions here.", "Anzeigentext generieren, um Versionen hier zu sehen.", ""];
              const needsUpdate = forceUpdate || currentContent === "" || oldPlaceholders.some(ph => currentContent.includes(ph)) || tc.querySelector(`p[data-i18n-key="${messageKey}"]`);

              if (needsUpdate) {
                  tc.innerHTML = `<p data-i18n-key="${messageKey}">${message}</p>`;
              }
          }
      });
  }
}

export function updateAngleAdsContainerPlaceholder(forceUpdate = false) {
    const messageKey = 'tabGenerateAdCopyMessage'; // Re-using the same message key for simplicity
    const message = chrome.i18n.getMessage(messageKey);
    if (dom.angleAdsContainer) { // Safely access angleAdsContainer
        const currentContent = dom.angleAdsContainer.innerHTML.trim();
        const oldPlaceholders = ["Angle-Anzeigen werden hier angezeigt", "Angle ads will be shown here.", ""];
        const needsUpdate = forceUpdate || currentContent === "" || oldPlaceholders.some(ph => currentContent.includes(ph)) || dom.angleAdsContainer.querySelector(`p[data-i18n-key="${messageKey}"]`);

        if (needsUpdate) {
            dom.angleAdsContainer.innerHTML = `<p data-i18n-key="${messageKey}">${message}</p>`;
        }
    }
}
