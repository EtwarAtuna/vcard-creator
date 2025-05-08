// Firebase Configuration (same as admin.js and brochure.js)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const vcardContainer = document.getElementById('vcard-container');
const saveContactBtn = document.getElementById('save-contact');
const shareBtn = document.getElementById('share-card');
const qrCodeContainer = document.getElementById('qr-code');

// Get vCard ID from URL
const urlParams = new URLSearchParams(window.location.search);
const cardId = urlParams.get('id');

// Load vCard data
async function loadVCard() {
    try {
        if (!cardId) {
            showError('No vCard ID provided');
            return;
        }

        const doc = await db.collection('vcards').doc(cardId).get();
        
        if (!doc.exists) {
            showError('vCard not found');
            return;
        }

        const data = doc.data();
        renderVCard(data);
        generateQRCode();
        
        // Update view count
        await db.collection('vcards').doc(cardId).update({
            views: firebase.firestore.FieldValue.increment(1)
        });

    } catch (error) {
        console.error('Error loading vCard:', error);
        showError('Error loading vCard');
    }
}

// Render vCard
function renderVCard(data) {
    vcardContainer.innerHTML = `
        <div class="flex flex-col items-center p-8" style="background-color: ${data.backgroundColor || '#ffffff'}">
            <div class="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 mb-4 mx-auto shadow-xl ring-4 ring-white">
                ${data.photoUrl 
                    ? `<img src="${data.photoUrl}" alt="${data.fullName}" class="h-full w-full object-cover">`
                    : `<div class="h-full w-full flex items-center justify-center">
                        <i class="fas fa-user text-gray-400 text-4xl"></i>
                       </div>`
                }
            </div>
            
            <h1 class="text-3xl font-bold text-gray-900 text-center mb-2">${data.fullName}</h1>
            ${data.jobTitle ? `<p class="text-xl text-gray-700 text-center mb-1">${data.jobTitle}</p>` : ''}
            ${data.company ? `<p class="text-lg text-gray-600 text-center mb-6">${data.company}</p>` : ''}

            <div class="w-full max-w-md space-y-4 mb-8">
                ${data.email ? `
                    <a href="mailto:${data.email}" class="flex items-center p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <i class="fas fa-envelope text-indigo-500 w-6"></i>
                        <span class="ml-3 text-gray-700">${data.email}</span>
                    </a>
                ` : ''}
                
                ${data.phone ? `
                    <a href="tel:${data.phone}" class="flex items-center p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <i class="fas fa-phone text-indigo-500 w-6"></i>
                        <span class="ml-3 text-gray-700">${data.phone}</span>
                    </a>
                ` : ''}
                
                ${data.address ? `
                    <div class="flex items-center p-3 bg-white rounded-lg shadow-md">
                        <i class="fas fa-map-marker-alt text-indigo-500 w-6"></i>
                        <span class="ml-3 text-gray-700">${data.address}</span>
                    </div>
                ` : ''}
                
                ${data.website ? `
                    <a href="${data.website}" target="_blank" class="flex items-center p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <i class="fas fa-globe text-indigo-500 w-6"></i>
                        <span class="ml-3 text-gray-700">${data.website}</span>
                    </a>
                ` : ''}
            </div>

            <div class="flex justify-center space-x-6">
                ${data.linkedin ? `
                    <a href="${data.linkedin}" target="_blank" class="text-gray-400 hover:text-blue-600 transform transition-transform hover:scale-110 shadow-lg rounded-full p-3 bg-white hover:shadow-2xl">
                        <i class="fab fa-linkedin text-3xl"></i>
                    </a>
                ` : ''}
                
                ${data.facebook ? `
                    <a href="${data.facebook}" target="_blank" class="text-gray-400 hover:text-blue-700 transform transition-transform hover:scale-110 shadow-lg rounded-full p-3 bg-white hover:shadow-2xl">
                        <i class="fab fa-facebook text-3xl"></i>
                    </a>
                ` : ''}
                
                ${data.twitter ? `
                    <a href="${data.twitter}" target="_blank" class="text-gray-400 hover:text-blue-400 transform transition-transform hover:scale-110 shadow-lg rounded-full p-3 bg-white hover:shadow-2xl">
                        <i class="fab fa-twitter text-3xl"></i>
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Generate QR Code
function generateQRCode() {
    const url = window.location.href;
    const qr = new QRCode(qrCodeContainer, {
        text: url,
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Save Contact
saveContactBtn.addEventListener('click', async () => {
    try {
        const doc = await db.collection('vcards').doc(cardId).get();
        const data = doc.data();
        
        const vcard = generateVCardData(data);
        downloadVCard(vcard, data.fullName);
        
    } catch (error) {
        console.error('Error saving contact:', error);
        showToast('Error saving contact', 'error');
    }
});

// Share Card
shareBtn.addEventListener('click', async () => {
    const url = window.location.href;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Digital Business Card',
                text: 'Check out my digital business card!',
                url: url
            });
        } catch (error) {
            console.error('Error sharing:', error);
            copyToClipboard(url);
        }
    } else {
        copyToClipboard(url);
    }
});

// Helper Functions

function generateVCardData(data) {
    return `BEGIN:VCARD
VERSION:3.0
FN:${data.fullName}
${data.jobTitle ? `TITLE:${data.jobTitle}\n` : ''}
${data.company ? `ORG:${data.company}\n` : ''}
${data.email ? `EMAIL:${data.email}\n` : ''}
${data.phone ? `TEL:${data.phone}\n` : ''}
${data.address ? `ADR:;;${data.address};;;;\n` : ''}
${data.website ? `URL:${data.website}\n` : ''}
${data.linkedin ? `X-SOCIALPROFILE;type=linkedin:${data.linkedin}\n` : ''}
${data.facebook ? `X-SOCIALPROFILE;type=facebook:${data.facebook}\n` : ''}
${data.twitter ? `X-SOCIALPROFILE;type=twitter:${data.twitter}\n` : ''}
END:VCARD`;
}

function downloadVCard(vcard, name) {
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-vcard.vcf`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast('Link copied to clipboard!'))
        .catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy link', 'error');
        });
}

function showError(message) {
    vcardContainer.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">Oops!</h2>
            <p class="text-gray-600">${message}</p>
        </div>
    `;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 bg-white text-gray-900 px-6 py-4 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 ${type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'}`;
    
    toast.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle text-red-500' : 'check-circle text-green-500'} text-xl"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    }, 10);
    
    // Remove toast after delay
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadVCard);
