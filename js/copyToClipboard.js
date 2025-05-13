// Helper function to copy text to clipboard and show feedback
export function copyToClipboard(text, descriptiveName = 'Text') {
    if (!text) {
        console.warn(`Attempted to copy empty ${descriptiveName} to clipboard`);
        return;
    }
    
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log(`${descriptiveName} copied to clipboard`);
            showCopyFeedback(descriptiveName);
        })
        .catch(err => {
            console.error(`Could not copy ${descriptiveName} to clipboard:`, err);
        });
}

// Show a temporary feedback message when text is copied
function showCopyFeedback(descriptiveName) {
    // Create a feedback element if it doesn't exist
    let feedbackEl = document.getElementById('copyFeedback');
    if (!feedbackEl) {
        feedbackEl = document.createElement('div');
        feedbackEl.id = 'copyFeedback';
        feedbackEl.style.position = 'fixed';
        feedbackEl.style.bottom = '20px';
        feedbackEl.style.left = '50%';
        feedbackEl.style.transform = 'translateX(-50%)';
        feedbackEl.style.backgroundColor = 'var(--primary-green, #10b981)';
        feedbackEl.style.color = 'white';
        feedbackEl.style.padding = '8px 16px';
        feedbackEl.style.borderRadius = '4px';
        feedbackEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        feedbackEl.style.zIndex = '1000';
        feedbackEl.style.opacity = '0';
        feedbackEl.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(feedbackEl);
    }

    // Set the message and show the feedback
    const copiedText = chrome.i18n.getMessage('copiedToClipboardText') || 'copied to clipboard';
    feedbackEl.textContent = `${descriptiveName} ${copiedText}`;
    feedbackEl.style.opacity = '1';

    // Hide the feedback after a delay
    setTimeout(() => {
        feedbackEl.style.opacity = '0';
    }, 2000);
}

// Setup copy button listeners for the main preview section
export function setupCopyButtonListeners() {
    const copyButtons = [
        { 
            btn: document.getElementById('copyPrimaryTextBtn'), 
            textElement: document.getElementById('primaryText'),
            descriptiveName: chrome.i18n.getMessage('primarytextVLabel') || 'Primary Text'
        },
        { 
            btn: document.getElementById('copyHeadlineBtn'), 
            textElement: document.getElementById('headline'),
            descriptiveName: chrome.i18n.getMessage('headlineVLabel') || 'Headline'
        },
        { 
            btn: document.getElementById('copyDescriptionBtn'), 
            textElement: document.getElementById('description'),
            descriptiveName: chrome.i18n.getMessage('descriptionVLabel') || 'Description'
        }
    ];

    copyButtons.forEach(item => {
        if (item.btn && item.textElement) {
            item.btn.addEventListener('click', () => {
                copyToClipboard(item.textElement.innerText, item.descriptiveName);
            });
        } else if (!item.btn) {
            console.warn(`Copy button not found for ${item.descriptiveName}`);
        } else if (!item.textElement) {
            console.warn(`Text element not found for ${item.descriptiveName}`);
        }
    });
}
