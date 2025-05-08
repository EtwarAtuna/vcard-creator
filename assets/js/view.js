// DOM Elements
const viewPhoto = document.getElementById('view-photo');
const photoPlaceholder = document.getElementById('photo-placeholder');
const viewName = document.getElementById('view-name');
const viewJob = document.getElementById('view-job');
const viewCompany = document.getElementById('view-company');
const viewEmail = document.getElementById('view-email');
const viewPhone = document.getElementById('view-phone');
const viewAddress = document.getElementById('view-address');
const viewLinkedin = document.getElementById('view-linkedin');
const viewFacebook = document.getElementById('view-facebook');
const viewTwitter = document.getElementById('view-twitter');
const saveContactBtn = document.getElementById('save-contact');
const vcardView = document.getElementById('vcard-view');

// Get vCard ID from URL
const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('id');

// Load vCard data
document.addEventListener('DOMContentLoaded', () => {
    if (!cardId) {
        showError('No vCard ID provided');
        return;
    }

    const savedCards = JSON.parse(localStorage.getItem('vcards') || '[]');
    const card = savedCards.find(c => c.id === parseInt(cardId));

    if (!card) {
        showError('vCard not found');
        return;
    }

    displayCard(card);
});

// Display card data
function displayCard(card) {
    // Update photo
    if (card.photo) {
        viewPhoto.src = card.photo;
        viewPhoto.classList.remove('hidden');
        photoPlaceholder.classList.add('hidden');
    }

    // Update text content
    viewName.textContent = card.fullName;
    viewJob.textContent = card.jobTitle || 'Job Title';
    viewCompany.textContent = card.company || 'Company';
    viewEmail.textContent = card.email || 'email@example.com';
    viewPhone.textContent = card.phone || 'Phone number';
    viewAddress.textContent = card.address || 'Address';

    // Update social links
    updateSocialLink(viewLinkedin, card.linkedin);
    updateSocialLink(viewFacebook, card.facebook);
    updateSocialLink(viewTwitter, card.twitter);

    // Update background color
    if (card.backgroundColor) {
        vcardView.style.backgroundColor = card.backgroundColor;
    }
}

// Update social media link visibility and href
function updateSocialLink(element, value) {
    element.href = value || '#';
    element.style.opacity = value ? '1' : '0.5';
}

// Handle "Save Contact" button
saveContactBtn.addEventListener('click', () => {
    const savedCards = JSON.parse(localStorage.getItem('vcards') || '[]');
    const card = savedCards.find(c => c.id === parseInt(cardId));
    
    if (card) {
        const vcard = generateVCard(card);
        downloadVCard(vcard, card.fullName);
    }
});

// Generate vCard format
function generateVCard(card) {
    return `BEGIN:VCARD
VERSION:3.0
FN:${card.fullName}
ORG:${card.company || ''}
TITLE:${card.jobTitle || ''}
EMAIL:${card.email || ''}
TEL:${card.phone || ''}
ADR:;;${card.address || ''};;;;
END:VCARD`;
}

// Download vCard file
function downloadVCard(vcard, name) {
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fileName = name.replace(/\s+/g, '-').toLowerCase() || 'contact';
    
    a.href = url;
    a.download = `${fileName}-vcard.vcf`;
    a.click();
    
    window.URL.revokeObjectURL(url);
}

// Show error message
function showError(message) {
    const container = document.querySelector('.max-w-md');
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 text-center">
            <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h2 class="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p class="text-gray-600">${message}</p>
            <a href="index.html" class="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
                Go to vCard Creator
            </a>
        </div>
    `;
}
