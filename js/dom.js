/* Main View Elements */
export const mainView = document.getElementById('mainView');
export const inputContent = document.getElementById('inputContent');
export const copywriterSelect = document.getElementById('copywriterSelect');
export const formOfAddressSelect = document.getElementById('formOfAddressSelect');
export const generateBtn = document.getElementById('generateBtn');
export const resetBtn = document.getElementById('resetBtn');
export const saveToArchiveBtn = document.getElementById('saveToArchiveBtn');
export const viewArchiveBtn = document.getElementById('viewArchiveBtn'); // Button in main content area

export const primaryTextField = document.getElementById('primaryText');
export const headlineField = document.getElementById('headline');
export const descriptionField = document.getElementById('description');

export const copyPrimaryTextBtn = document.getElementById('copyPrimaryTextBtn');
export const copyHeadlineBtn = document.getElementById('copyHeadlineBtn');
export const copyDescriptionBtn = document.getElementById('copyDescriptionBtn');

export const multiVersionTabsContainer = document.getElementById('multiVersionTabsContainer');
export const primaryTextsTabContent = document.getElementById('primaryTextsTabContent');
export const headlinesTabContent = document.getElementById('headlinesTabContent');
export const descriptionsTabContent = document.getElementById('descriptionsTabContent');
export const tabLinks = document.querySelectorAll('.tab-navigation .tab-link');
export const tabContentsArr = document.querySelectorAll('.tab-content');

/* Options View Elements */
export const optionsView = document.getElementById('optionsView');
export const apiKeyInput = document.getElementById('apiKeyInput');
export const modelSelect = document.getElementById('modelSelect');
export const saveSettingsBtn = document.getElementById('saveSettingsBtn');
export const backToMainBtnFromOptions = document.getElementById('backToMainBtnFromOptions');

/* Info View Elements */
export const infoView = document.getElementById('infoView');
export const systemPromptDisplay = document.getElementById('systemPromptDisplay');
export const backToMainBtnFromInfo = document.getElementById('backToMainBtnFromInfo');

/* Archive View Elements */
export const archiveView = document.getElementById('archiveView');
export const archiveListContainer = document.getElementById('archiveListContainer');
export const emptyArchiveMessage = document.getElementById('emptyArchiveMessage');
export const backToMainBtnFromArchive = document.getElementById('backToMainBtnFromArchive');

/* Persona View Elements (Create/Edit) */
export const personaView = document.getElementById('personaView');
export const personaBaseDescription = document.getElementById('personaBaseDescription');
export const generatePersonaBtn = document.getElementById('generatePersonaBtn');
export const generatedPersonaContainer = document.getElementById('generatedPersonaContainer');
export const generatedPersonaText = document.getElementById('generatedPersonaText');
export const personaLoadingErrorPlaceholder = document.getElementById('personaLoadingErrorPlaceholder');
export const saveCurrentPersonaBtn = document.getElementById('saveCurrentPersonaBtn');
export const backToMainBtnFromPersona = document.getElementById('backToMainBtnFromPersona');

/* Persona List View Elements */
export const personaListView = document.getElementById('personaListView');
export const personaListContainer = document.getElementById('personaListContainer');
export const emptyPersonaListMessage = document.getElementById('emptyPersonaListMessage');
export const createNewPersonaBtn = document.getElementById('createNewPersonaBtn');
// export const backToPersonaViewBtn = document.getElementById('backToPersonaViewBtn'); // Replaced by backToMainBtnFromPersonaList
export const backToMainBtnFromPersonaList = document.getElementById('backToMainBtnFromPersonaList'); // New back button for persona list view

/* Active Persona Display in Main View */
export const activePersonaDisplayContainer = document.getElementById('activePersonaDisplayContainer');
export const activePersonaDisplay = document.getElementById('activePersonaDisplay');
export const changePersonaBtn = document.getElementById('changePersonaBtn');

/* Global Header Icons */
export const globalArchiveIcon = document.getElementById('globalArchiveIcon');
export const globalPersonasIcon = document.getElementById('globalPersonasIcon'); // Icon for Persona List View (👥)
export const globalCurrentPersonaIcon = document.getElementById('globalCurrentPersonaIcon'); // Icon for Persona Create/Edit View (👤)
export const globalInfoIcon = document.getElementById('globalInfoIcon');
export const globalSettingsIcon = document.getElementById('globalSettingsIcon');
