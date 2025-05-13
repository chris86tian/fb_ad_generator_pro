/**
 * Copies the provided text to the clipboard and provides user feedback.
 * @param {string} text - The text to copy.
 * @param {string} fieldName - A descriptive name of the field being copied (for feedback).
 */
export function copyToClipboard(text, fieldName) {
  // Define texts that should not be copied
  const nonCopyableTexts = [
    chrome.i18n.getMessage('naText'),
    chrome.i18n.getMessage('willBeFilledText'),
    chrome.i18n.getMessage('generatingText'),
    chrome.i18n.getMessage('errorGeneratingText'),
    chrome.i18n.getMessage('notFoundText'),
    chrome.i18n.getMessage('couldNotParseText'),
    "", // Empty string
    null, // Null value
    undefined // Undefined value
  ];

  // Check if the text is null, undefined, or in the non-copyable list
  if (text == null || nonCopyableTexts.includes(text.trim())) {
    console.log(`Copy prevented for field "${fieldName}": Text is non-copyable or empty.`);
    // Optionally provide visual feedback that copy failed/was prevented
    // e.g., temporarily change button style or show a small message
    return;
  }

  navigator.clipboard.writeText(text)
    .then(() => {
      console.log(`"${fieldName}" copied to clipboard.`);
      // Optional: Provide visual feedback for success (e.g., change button icon/text briefly)
      // Example: Find the button related to this fieldName and update it
    })
    .catch(err => {
      console.error(`Error copying "${fieldName}" to clipboard: `, err);
      alert(chrome.i18n.getMessage('copyErrorAlert', [fieldName]));
    });
}

/**
 * Sets up copy listeners for the main ad fields (Primary Text, Headline, Description).
 */
export function setupCopyButtonListeners() {
    const mainFields = [
        // Corrected IDs to match popup.html
        { btnId: 'copyPrimaryTextBtn', fieldId: 'primaryText', nameKey: 'primaryTextLabel' },
        { btnId: 'copyHeadlineBtn', fieldId: 'headline', nameKey: 'headlineLabel' },
        { btnId: 'copyDescriptionBtn', fieldId: 'description', nameKey: 'descriptionLabel' }
    ];

    mainFields.forEach(field => {
        const button = document.getElementById(field.btnId);
        const textElement = document.getElementById(field.fieldId);
        const fieldName = chrome.i18n.getMessage(field.nameKey); // Get localized name

        if (button && textElement) {
            button.addEventListener('click', () => {
                // Use dataset.originalContent if available, otherwise use innerText
                const textToCopy = textElement.dataset.originalContent || textElement.innerText;
                copyToClipboard(textToCopy, fieldName);
            });
        } else {
            console.warn(`Copy button (${field.btnId}) or text element (${field.fieldId}) not found.`);
        }
    });

    // Note: Listeners for copy buttons within the tabs (version-item)
    // are added dynamically in adDisplay.js when the items are created.
}
