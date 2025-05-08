// DOM Elements
const form = document.getElementById('vcard-form');
const photoInput = form.querySelector('input[name="photo"]');
const previewPhoto = document.getElementById('preview-photo');
const photoPlaceholder = document.getElementById('photo-placeholder');
const previewPhotoDisplay = document.getElementById('preview-photo-display');
const photoPlaceholderPreview = document.getElementById('photo-placeholder-preview');
const saveVCardButton = document.getElementById('save-vcard');
const vcardPreview = document.getElementById('vcard-preview');

// Preview Elements
const previewName = document.getElementById('preview-name');
const previewJob = document.getElementById('preview-job');
const previewCompany = document.getElementById('preview-company');
const previewEmail = document.getElementById('preview-email');
const previewPhone = document.getElementById('preview-phone');
const previewAddress = document.getElementById('preview-address');
const previewLinkedin = document.getElementById('preview-linkedin');
const previewFacebook = document.getElementById('preview-facebook');
const previewTwitter = document.getElementById('preview-twitter');
const previewWebsite = document.getElementById('preview-website');

// Handle photo upload
photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const photoUrl = e.target.result;
            updatePhotoPreviews(photoUrl);
        };
        reader.readAsDataURL(file);
    }
});

// Update both photo previews
function updatePhotoPreviews(photoUrl) {
    // Update form preview
    previewPhoto.src = photoUrl;
    previewPhoto.classList.remove('hidden');
    photoPlaceholder.classList.add('hidden');
    
    // Update card preview
    previewPhotoDisplay.src = photoUrl;
    previewPhotoDisplay.classList.remove('hidden');
    photoPlaceholderPreview.classList.add('hidden');
}

// Handle form input changes for live preview
form.addEventListener('input', (e) => {
    const target = e.target;
    
    switch(target.name) {
        case 'fullName':
            previewName.textContent = target.value || 'Your Name';
            break;
        case 'jobTitle':
            previewJob.textContent = target.value || 'Job Title';
            break;
        case 'company':
            previewCompany.textContent = target.value || 'Company';
            break;
        case 'email':
            previewEmail.textContent = target.value || 'email@example.com';
            break;
        case 'phone':
            previewPhone.textContent = target.value || 'Phone number';
            break;
        case 'address':
            previewAddress.textContent = target.value || 'Address';
            break;
        case 'linkedin':
            updateSocialLink(previewLinkedin, target.value);
            break;
        case 'facebook':
            updateSocialLink(previewFacebook, target.value);
            break;
        case 'twitter':
            updateSocialLink(previewTwitter, target.value);
            break;
        case 'website':
            updateSocialLink(previewWebsite, target.value);
            break;
        case 'backgroundColor':
            vcardPreview.style.backgroundColor = target.value;
            break;
    }
});

// Update social media link visibility and href
function updateSocialLink(element, value) {
    element.href = value || '#';
    element.style.opacity = value ? '1' : '0.5';
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(form);
    const vCardData = {
        fullName: formData.get('fullName'),
        jobTitle: formData.get('jobTitle'),
        company: formData.get('company'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        linkedin: formData.get('linkedin'),
        facebook: formData.get('facebook'),
        twitter: formData.get('twitter'),
        website: formData.get('website'),
        backgroundColor: formData.get('backgroundColor'),
        photo: await getPhotoDataUrl()
    };
    
    // Store in localStorage
    const savedCards = JSON.parse(localStorage.getItem('vcards') || '[]');
    savedCards.push({
        ...vCardData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'active'
    });
    localStorage.setItem('vcards', JSON.stringify(savedCards));
    
    // Generate shareable link
    const shareableLink = `${window.location.origin}/view.html?id=${savedCards[savedCards.length - 1].id}`;
    
    // Show success message with link
    showToast('vCard created successfully!', shareableLink);
});

// Handle "Save to Contacts" button
saveVCardButton.addEventListener('click', () => {
    const vcard = generateVCard();
    downloadVCard(vcard);
});

// Helper function to get photo data URL
async function getPhotoDataUrl() {
    const photoFile = photoInput.files[0];
    if (!photoFile) return null;
    
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(photoFile);
    });
}

// Helper function to generate vCard format
function generateVCard() {
    const name = document.querySelector('input[name="fullName"]').value;
    const company = document.querySelector('input[name="company"]').value;
    const title = document.querySelector('input[name="jobTitle"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const phone = document.querySelector('input[name="phone"]').value;
    const address = document.querySelector('textarea[name="address"]').value;
    
    return `BEGIN:VCARD
VERSION:3.0
FN:${name}
ORG:${company}
TITLE:${title}
EMAIL:${email}
TEL:${phone}
ADR:;;${address};;;;
URL:${document.querySelector('input[name="website"]').value}
END:VCARD`;
}

// Helper function to download vCard file
function downloadVCard(vcard) {
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = document.querySelector('input[name="fullName"]').value.replace(/\s+/g, '-').toLowerCase() || 'contact';
    
    a.href = url;
    a.download = `${name}-vcard.vcf`;
    a.click();
    
    window.URL.revokeObjectURL(url);
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector('.fa-copy').parentElement;
        copyBtn.innerHTML = '<i class="fas fa-check text-green-500"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Show toast notification
function showToast(message, link = null) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-white text-gray-900 px-6 py-4 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300';
    
    let content = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-check-circle text-green-500 text-xl"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">${message}</p>
    `;
    
    if (link) {
        content += `
                <div class="mt-2">
                    <p class="text-sm text-gray-600">Shareable Link:</p>
                    <div class="mt-1 flex items-center space-x-2">
                        <input type="text" value="${link}" readonly class="text-sm bg-gray-50 px-2 py-1 rounded border flex-grow">
                        <button onclick="copyToClipboard('${link}')" class="text-indigo-600 hover:text-indigo-500">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
        `;
    }
    
    content += `
            </div>
        </div>
    `;
    
    toast.innerHTML = content;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    }, 10);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
