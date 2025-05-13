// This file handles the dynamic generation of headers for different views
// and sets up event listeners for header controls

import { showView } from './viewManagement.js';

// Generate HTML for the header based on the view
export function generateHeaderHtml(titleKey, showBackButton = true) {
    // Get translated title text
    let titleText = chrome.i18n.getMessage(titleKey) || 'FB Ad Filler';
    
    // Special case for main view which includes the "Design by" link
    const isMainView = titleKey === 'appName';
    const designByHtml = isMainView ? 
        `<span class="design-by-link">
            <a href="https://lipa.life" target="_blank" data-i18n-key="designByText">Design by Lipa LIFE</a>
        </span>` : '';
    
    // Back button HTML if needed
    const backButtonHtml = showBackButton ? 
        `<div class="back-icon" title="${chrome.i18n.getMessage('backButton') || 'Back'}">
            ←
        </div>` : '';
    
    // Header controls for main view only
    const headerControlsHtml = isMainView ? 
        `<div class="header-controls">
            <div class="header-icon" id="personaBtn" title="${chrome.i18n.getMessage('personaButtonTitle') || 'Create/Edit Persona'}">
                👤
            </div>
            <div class="header-icon" id="personaListBtn" title="${chrome.i18n.getMessage('personaListButtonTitle') || 'Persona List'}">
                👥
            </div>
            <div class="header-icon" id="archiveBtn" title="${chrome.i18n.getMessage('archiveButtonTitle') || 'Archive'}">
                🗃️
            </div>
            <div class="header-icon" id="infoBtn" title="${chrome.i18n.getMessage('infoButtonTitle') || 'Info'}">
                ℹ️
            </div>
            <div class="header-icon" id="settingsBtn" title="${chrome.i18n.getMessage('settingsButtonTitle') || 'Settings'}">
                ⚙️
            </div>
        </div>` : '';
    
    // Assemble the complete header HTML
    return `
        <div class="header">
            ${backButtonHtml}
            <div class="header-title" data-i18n-key="${titleKey}">${titleText}</div>
            ${designByHtml}
            ${headerControlsHtml}
        </div>
    `;
}

// Add event listeners to header elements
export function addHeaderEventListeners(headerElement) {
    // Back button
    const backButton = headerElement.querySelector('.back-icon');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Determine which view to go back to based on current view
            const currentView = headerElement.closest('[id$="View"]');
            if (currentView) {
                const viewId = currentView.id;
                
                if (viewId === 'personaListView') {
                    showView('main');
                } else if (viewId === 'personaView') {
                    showView('main');
                } else {
                    // Default back behavior for other views
                    showView('main');
                }
            } else {
                console.warn('Could not determine current view for back button');
                showView('main');
            }
        });
    }
    
    // Main view header controls
    const personaBtn = headerElement.querySelector('#personaBtn');
    const personaListBtn = headerElement.querySelector('#personaListBtn');
    const archiveBtn = headerElement.querySelector('#archiveBtn');
    const infoBtn = headerElement.querySelector('#infoBtn');
    const settingsBtn = headerElement.querySelector('#settingsBtn');
    
    if (personaBtn) {
        personaBtn.addEventListener('click', () => showView('persona'));
    }
    
    if (personaListBtn) {
        personaListBtn.addEventListener('click', () => showView('personaListView'));
    }
    
    if (archiveBtn) {
        archiveBtn.addEventListener('click', () => showView('archive'));
    }
    
    if (infoBtn) {
        infoBtn.addEventListener('click', () => showView('info'));
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => showView('options'));
    }
}
