// DOM element references for the extension
// This centralizes all DOM element references to avoid scattered querySelector calls

// Main view elements
export const mainView = document.getElementById('mainView');
export const optionsView = document.getElementById('optionsView');
export const infoView = document.getElementById('infoView');
export const archiveView = document.getElementById('archiveView');
export const personaView = document.getElementById('personaView');
export const personaListView = document.getElementById('personaListView');

// Navigation buttons
export const backToMainBtnFromOptions = document.querySelector('#optionsView .back-icon');
export const backToMainBtnFromInfo = document.querySelector('#infoView .back-icon');
export const backToMainBtnFromArchive = document.querySelector('#archiveView .back-icon');
export const backToMainBtnFromPersona = document.querySelector('#personaView .back-icon');
export const backToPersonaViewBtn = document.querySelector('#personaListView .back-icon');

// Input section elements
export const copywriterSelect = document.getElementById('copywriterSelect');
export const formOfAddressSelect = document.getElementById('formOfAddressSelect');
export const inputContent = document.getElementById('inputContent');
export const generateBtn = document.getElementById('generateBtn');
export const resetBtn = document.getElementById('resetBtn');
export const saveToArchiveBtn = document.getElementById('saveToArchiveBtn');
export const changePersonaBtn = document.getElementById('changePersonaBtn');
export const activePersonaDisplay = document.getElementById('activePersonaDisplay');

// Preview section elements
export const primaryTextField = document.getElementById('primaryText');
export const headlineField = document.getElementById('headline');
export const descriptionField = document.getElementById('description');
export const copyPrimaryTextBtn = document.getElementById('copyPrimaryTextBtn');
export const copyHeadlineBtn = document.getElementById('copyHeadlineBtn');
export const copyDescriptionBtn = document.getElementById('copyDescriptionBtn');

// Tab container and content elements
export const multiVersionTabsContainer = document.getElementById('multiVersionTabsContainer');
export const allVersionsTabContent = document.getElementById('allVersionsTabContent');

// Options view elements
export const apiKeyInput = document.getElementById('apiKeyInput');
export const modelSelect = document.getElementById('modelSelect');
export const saveSettingsBtn = document.getElementById('saveSettingsBtn');

// Info view elements
export const systemPromptDisplay = document.getElementById('systemPromptDisplay');

// Archive view elements
export const archiveListContainer = document.getElementById('archiveListContainer');
export const emptyArchiveMessage = document.getElementById('emptyArchiveMessage');

// Persona view elements
export const personaBaseDescription = document.getElementById('personaBaseDescription');
export const generatePersonaBtn = document.getElementById('generatePersonaBtn');
export const generatedPersonaText = document.getElementById('generatedPersonaText');
export const saveCurrentPersonaBtn = document.getElementById('saveCurrentPersonaBtn');
export const personaLoadingErrorPlaceholder = document.getElementById('personaLoadingErrorPlaceholder');

// Persona list view elements
export const personaListContainer = document.getElementById('personaListContainer');
export const emptyPersonaListMessage = document.getElementById('emptyPersonaListMessage');
export const createNewPersonaBtn = document.getElementById('createNewPersonaBtn');

// Function to ensure all DOM elements are available
export function validateDomElements() {
    const criticalElements = [
        { name: 'mainView', element: mainView },
        { name: 'optionsView', element: optionsView },
        { name: 'infoView', element: infoView },
        { name: 'archiveView', element: archiveView },
        { name: 'personaView', element: personaView },
        { name: 'personaListView', element: personaListView },
        { name: 'copywriterSelect', element: copywriterSelect },
        { name: 'formOfAddressSelect', element: formOfAddressSelect },
        { name: 'inputContent', element: inputContent },
        { name: 'generateBtn', element: generateBtn },
        { name: 'resetBtn', element: resetBtn },
        { name: 'primaryTextField', element: primaryTextField },
        { name: 'headlineField', element: headlineField },
        { name: 'descriptionField', element: descriptionField },
        { name: 'multiVersionTabsContainer', element: multiVersionTabsContainer },
        { name: 'allVersionsTabContent', element: allVersionsTabContent }
    ];

    let missingElements = criticalElements.filter(item => !item.element);
    
    if (missingElements.length > 0) {
        console.error('Missing critical DOM elements:', missingElements.map(item => item.name).join(', '));
        return false;
    }
    
    console.log('All critical DOM elements are available.');
    return true;
}
