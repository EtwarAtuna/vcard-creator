// DOM Elements
const form = document.getElementById('vcard-form');
const vcardPreview = document.getElementById('vcard-preview');
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
const photoInput = form.querySelector('input[name="photo"]');
const previewPhoto = document.getElementById('preview-photo');
const photoPlaceholder = document.getElementById('photo-placeholder');
const previewPhotoDisplay = document.getElementById('preview-photo-display');
const photoPlaceholderPreview = document.getElementById('photo-placeholder-preview');
const saveVCardButton = document.getElementById('save-vcard');
const syncButton = document.getElementById('sync-btn');
const companyDescription = document.getElementById('company-description');
const saveDescriptionButton = document.getElementById('save-description');
const brochureImageInput = document.getElementById('brochure-image-input');
const uploadImagesButton = document.getElementById('upload-images');
const imagePreviewGrid = document.getElementById('image-preview-grid');
const contactSearch = document.getElementById('contact-search');
const contactFilter = document.getElementById('contact-filter');
const exportContactsButton = document.getElementById('export-contacts');
const contactsTableBody = document.getElementById('contacts-table-body');

// Tab Switching
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active', 'border-indigo-500', 'text-indigo-600'));
        tabContents.forEach(content => content.classList.add('hidden'));
        
        // Add active class to clicked button
        button.classList.add('active', 'border-indigo-500', 'text-indigo-600');
        
        // Show corresponding content
        const tabId = button.dataset.tab;
        document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    });
});

// Firebase instances are imported from config.js


// Handle photo upload
photoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            const result = await storage.uploadFile(file, 'profiles');
            updatePhotoPreviews(result.url);
            showToast('Photo uploaded successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            showToast('Error uploading photo. Please try again.', 'error');
        }
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
    
    try {
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
            createdAt: new Date().toISOString()
        };

        // Add photo URL if exists
        if (previewPhoto.src && !previewPhoto.classList.contains('hidden')) {
            vCardData.photoUrl = previewPhoto.src;
        }

        // Save to local storage
        const docRef = await db.collection('vcards').add(vCardData);
        
        // Generate shareable link
        const shareableLink = `${window.location.origin}/view.html?id=${docRef.id}`;
        
        // Show success message with shareable link
        showToast('vCard created successfully!', shareableLink);
        
        // Reset form
        form.reset();
        resetPreviews();
    } catch (error) {
        console.error('Error creating vCard:', error);
        showToast('Error creating vCard. Please try again.', null, 'error');
    }
});

// Handle "Save to Contacts" button
saveVCardButton.addEventListener('click', () => {
    const vcard = generateVCard();
    downloadVCard(vcard);
});

// Sync button functionality
syncButton.addEventListener('click', async () => {
    try {
        await syncData();
        showToast('Data synchronized successfully!');
    } catch (error) {
        console.error('Sync error:', error);
        showToast('Error synchronizing data. Please try again.', null, 'error');
    }
});

// Brochure image upload
brochureImageInput.addEventListener('change', () => {
    const files = brochureImageInput.files;
    previewBrochureImages(files);
});

uploadImagesButton.addEventListener('click', async () => {
    const files = brochureImageInput.files;
    if (files.length === 0) {
        showToast('Please select images to upload.', 'error');
        return;
    }

    try {
        const uploadPromises = Array.from(files).map(file => storage.uploadFile(file, 'brochure'));

        const results = await Promise.all(uploadPromises);
        const urls = results.map(result => result.url);

        await saveBrochureImages(urls);
        showToast('Images uploaded successfully!');
        refreshImageGrid();

        // Clear the file input
        brochureImageInput.value = '';
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Error uploading images. Please try again.', 'error');
    }
});

// Save company description
saveDescriptionButton.addEventListener('click', async () => {
    try {
        await saveCompanyDescription(companyDescription.value);
        showToast('Company description saved successfully!');
    } catch (error) {
        console.error('Save error:', error);
        showToast('Error saving description. Please try again.', null, 'error');
    }
});

// Contact search and filter
contactSearch.addEventListener('input', () => {
    filterContacts();
});

contactFilter.addEventListener('change', () => {
    filterContacts();
});

// Export contacts
exportContactsButton.addEventListener('click', async () => {
    try {
        await exportContacts();
        showToast('Contacts exported successfully!');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Error exporting contacts. Please try again.', null, 'error');
    }
});

// Helper Functions

async function syncData() {
    // Implement data synchronization with server
    // This is a placeholder for the actual implementation
    return new Promise(resolve => setTimeout(resolve, 1000));
}

function previewBrochureImages(files) {
    imagePreviewGrid.innerHTML = '';
    Array.from(files).forEach(file => {
        const div = document.createElement('div');
        div.className = 'relative aspect-w-4 aspect-h-3 animate-pulse bg-gray-200 rounded-lg';
        imagePreviewGrid.appendChild(div);

        const reader = new FileReader();
        reader.onload = (e) => {
            div.classList.remove('animate-pulse', 'bg-gray-200');
            div.innerHTML = `
                <img src="${e.target.result}" alt="Preview" class="object-cover rounded-lg">
                <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity"></div>
            `;
        };
        reader.readAsDataURL(file);
    });
}

async function saveBrochureImages(urls) {
    try {
        const doc = await db.collection('brochure').doc('images').get();
        const existingUrls = doc.exists ? doc.data().images || [] : [];
        
        await db.collection('brochure').doc('images').set({
            images: [...existingUrls, ...urls],
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error saving brochure images:', error);
        throw error;
    }
}

async function saveCompanyDescription(description) {
    try {
        await db.collection('brochure').doc('description').set({
            content: description,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error saving company description:', error);
        throw error;
    }
}

async function refreshContactsTable() {
    if (!contactsTableBody) return;

    try {
        const contacts = await db.collection('vcards').get();
        const filteredContacts = contacts.docs.filter(doc => {
            const data = doc.data();
            const searchTerm = (contactSearch?.value || '').toLowerCase();
            const filterValue = contactFilter?.value || 'all';
            
            // Search term filtering
            const matchesSearch = !searchTerm || 
                data.fullName?.toLowerCase().includes(searchTerm) ||
                data.email?.toLowerCase().includes(searchTerm) ||
                data.company?.toLowerCase().includes(searchTerm);
            
            // Status filtering
            const matchesFilter = filterValue === 'all' || 
                (filterValue === 'active' && data.active) ||
                (filterValue === 'inactive' && !data.active);
            
            return matchesSearch && matchesFilter;
        });

        const rows = filteredContacts.map(doc => {
            const data = doc.data();
            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            ${data.photoUrl ? 
                                `<img src="${data.photoUrl}" alt="" class="h-10 w-10 rounded-full mr-3">` :
                                `<div class="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                    <i class="fas fa-user text-gray-400"></i>
                                </div>`
                            }
                            <div>
                                <div class="text-sm font-medium text-gray-900">${data.fullName}</div>
                                <div class="text-sm text-gray-500">${data.company || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${data.email || ''}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${data.phone || ''}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(data.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="/view.html?id=${doc.id}" target="_blank" class="text-indigo-600 hover:text-indigo-900">
                            View
                        </a>
                    </td>
                </tr>
            `;
        });

        contactsTableBody.innerHTML = rows.join('');
    } catch (error) {
        console.error('Error refreshing contacts table:', error);
        showToast('Error loading contacts', 'error');
    }
}

function filterContacts() {
    refreshContactsTable();
}

async function exportContacts() {
    // Implement contact export logic
    const contacts = await db.collection('vcards').get();
    const data = contacts.docs.map(doc => doc.data());
    
    // Create CSV
    const csv = convertToCSV(data);
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function convertToCSV(data) {
    const headers = ['Full Name', 'Job Title', 'Company', 'Email', 'Phone', 'Address'];
    const rows = data.map(item => [
        item.fullName,
        item.jobTitle,
        item.company,
        item.email,
        item.phone,
        item.address
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function showToast(message, link = null, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 bg-white text-gray-900 px-6 py-4 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 ${type === 'error' ? 'border-l-4 border-red-500' : ''}`;
    
    let content = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle text-red-500' : 'check-circle text-green-500'} text-xl"></i>
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
    
    // Remove toast after delay
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial active tab
    document.querySelector('.tab-btn[data-tab="vcard"]').click();

    // Load saved data
    (async () => {
        try {
            // Load company description
            const descDoc = await db.collection('brochure').doc('description').get();
            if (descDoc.exists && companyDescription) {
                companyDescription.value = descDoc.data().content;
            }

            // Load brochure images
            const imagesDoc = await db.collection('brochure').doc('images').get();
            if (imagesDoc.exists && imagePreviewGrid) {
                const images = imagesDoc.data().images || [];
                images.forEach(url => {
                    const div = document.createElement('div');
                    div.className = 'relative aspect-w-4 aspect-h-3 group';
                    div.innerHTML = `
                        <img src="${url}" alt="Brochure image" class="object-cover rounded-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity">
                            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="deleteBrochureImage('${url}')" 
                                        class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    imagePreviewGrid.appendChild(div);
                });
            }

            // Initialize contact table if it exists
            if (contactsTableBody) {
                const contacts = await db.collection('vcards').get();
                const rows = contacts.docs.map(doc => {
                    const data = doc.data();
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">${data.fullName}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${data.email}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${data.phone}</td>
                            <td class="px-6 py-4 whitespace-nowrap">${new Date(data.createdAt).toLocaleDateString()}</td>
                        </tr>
                    `;
                });
                contactsTableBody.innerHTML = rows.join('');
            }
        } catch (error) {
            console.error('Initialization error:', error);
            showToast('Error loading data. Please refresh the page.', 'error');
        }
    })();
});

// Delete brochure image
async function deleteBrochureImage(urlToDelete) {
    try {
        const doc = await db.collection('brochure').doc('images').get();
        if (doc.exists) {
            const images = doc.data().images.filter(url => url !== urlToDelete);
            await db.collection('brochure').doc('images').set({
                images,
                updatedAt: new Date().toISOString()
            });
            showToast('Image deleted successfully!');
            
            // Refresh the image grid
            if (imagePreviewGrid) {
                imagePreviewGrid.innerHTML = '';
                images.forEach(url => {
                    const div = document.createElement('div');
                    div.className = 'relative aspect-w-4 aspect-h-3 group';
                    div.innerHTML = `
                        <img src="${url}" alt="Brochure image" class="object-cover rounded-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity">
                            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="deleteBrochureImage('${url}')" 
                                        class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    imagePreviewGrid.appendChild(div);
                });
            }
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        showToast('Error deleting image', 'error');
    }
}

// Copy to clipboard helper
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
