import { showView } from './viewManagement.js';
// Note: dom.js is not directly imported here to avoid circular dependencies if header.js is imported by dom.js or viewManagement.js
// Instead, elements are queried within the provided headerElement.

export function generateHeaderHtml(titleKey, showBackButton) {
    const appName = chrome.i18n.getMessage('appName'); // Assuming 'appName' is the key for the main title
    const viewTitle = titleKey === 'appName' ? appName : chrome.i18n.getMessage(titleKey);
    const backButtonTitle = chrome.i18n.getMessage('backButton');

    const archiveIconTitle = chrome.i18n.getMessage('archiveViewTitle');
    const personasIconTitle = chrome.i18n.getMessage('personaListViewTitle');
    const currentPersonaIconTitle = chrome.i18n.getMessage('currentPersonaViewTitle');
    const infoIconTitle = chrome.i18n.getMessage('infoTitle');
    const settingsIconTitle = chrome.i18n.getMessage('settingsTitle');

    const globalIconsHtml = `
        <span class="header-icon global-archive-icon" title="${archiveIconTitle}">🗃️</span>
        <span class="header-icon global-personas-icon" title="${personasIconTitle}">👥</span>
        <span class="header-icon global-current-persona-icon" title="${currentPersonaIconTitle}">👤</span>
        <span class="header-icon global-info-icon" title="${infoIconTitle}">ℹ️</span>
        <span class="header-icon global-settings-icon" title="${settingsIconTitle}">⚙️</span>
    `;

    let headerHtml = `<div class="header">`;

    if (showBackButton) {
        headerHtml += `<span class="back-icon" title="${backButtonTitle}">⬅️</span>`;
    }

    if (titleKey === 'appName') { // Special handling for the main view's header
        headerHtml += `
            <span class="header-title">${viewTitle}</span>
            <div class="design-by-link">
                <a href="https://www.lipalife.de" target="_blank" data-i18n-key="designByLinkText">${chrome.i18n.getMessage('designByLinkText')}</a>
            </div>
        `;
    } else {
        headerHtml += `<span class="header-title">${viewTitle}</span>`;
    }

    headerHtml += `
            <div class="header-controls">
                ${globalIconsHtml}
            </div>
        </div>
    `;
    return headerHtml;
}

export function addHeaderEventListeners(headerElement) {
    if (!headerElement) return;

    const backIcon = headerElement.querySelector('.back-icon');
    if (backIcon) {
        backIcon.addEventListener('click', () => showView('main'));
    }

    headerElement.querySelector('.global-archive-icon')?.addEventListener('click', () => showView('archive'));
    headerElement.querySelector('.global-personas-icon')?.addEventListener('click', () => showView('personaListView'));
    headerElement.querySelector('.global-current-persona-icon')?.addEventListener('click', () => {
        // This will show the persona view, and showView will handle calling
        // loadCurrentPersonaForEdit(null) which in turn calls clearPersonaCreationFields.
        showView('persona');
    });
    headerElement.querySelector('.global-info-icon')?.addEventListener('click', () => showView('info'));
    headerElement.querySelector('.global-settings-icon')?.addEventListener('click', () => showView('options'));
}
