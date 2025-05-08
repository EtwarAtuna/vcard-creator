// Brochure Image Management
class BrochureManager {
    constructor() {
        this.imagePreviewGrid = document.getElementById('image-preview-grid');
        this.brochureImageInput = document.getElementById('brochure-image-input');
        this.uploadImagesButton = document.getElementById('upload-images');
        this.companyDescription = document.getElementById('company-description');
        this.saveDescriptionButton = document.getElementById('save-description');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle image selection
        this.brochureImageInput.addEventListener('change', () => {
            this.previewImages(this.brochureImageInput.files);
        });

        // Handle image upload
        this.uploadImagesButton.addEventListener('click', async () => {
            await this.uploadImages();
        });

        // Handle company description save
        this.saveDescriptionButton.addEventListener('click', async () => {
            await this.saveDescription();
        });
    }

    previewImages(files) {
        this.imagePreviewGrid.innerHTML = '';
        Array.from(files).forEach(file => {
            const div = document.createElement('div');
            div.className = 'relative aspect-w-4 aspect-h-3 animate-pulse bg-gray-200 rounded-lg';
            this.imagePreviewGrid.appendChild(div);

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

    async uploadImages() {
        const files = this.brochureImageInput.files;
        if (files.length === 0) {
            showToast('Please select images to upload.', 'error');
            return;
        }

        try {
            const uploadPromises = Array.from(files).map(file => 
                storage.uploadFile(file, 'brochure')
            );

            const results = await Promise.all(uploadPromises);
            const urls = results.map(result => result.url);
            
            // Save URLs to brochure collection
            const brochureDoc = await db.collection('brochure').doc('images').get();
            const existingUrls = brochureDoc.exists ? brochureDoc.data().images || [] : [];
            
            await db.collection('brochure').doc('images').set({
                images: [...existingUrls, ...urls],
                updatedAt: new Date().toISOString()
            });

            showToast('Images uploaded successfully!');
            this.brochureImageInput.value = '';
            await this.refreshImageGrid();
        } catch (error) {
            console.error('Upload error:', error);
            showToast('Error uploading images. Please try again.', 'error');
        }
    }

    async saveDescription() {
        try {
            await db.collection('brochure').doc('description').set({
                content: this.companyDescription.value,
                updatedAt: new Date().toISOString()
            });
            showToast('Company description saved successfully!');
        } catch (error) {
            console.error('Error saving description:', error);
            showToast('Error saving description. Please try again.', 'error');
        }
    }

    async refreshImageGrid() {
        try {
            const doc = await db.collection('brochure').doc('images').get();
            if (doc.exists && doc.data().images) {
                const images = doc.data().images;
                this.imagePreviewGrid.innerHTML = '';
                
                images.forEach(url => {
                    const div = document.createElement('div');
                    div.className = 'relative aspect-w-4 aspect-h-3 group';
                    div.innerHTML = `
                        <img src="${url}" alt="Brochure image" class="object-cover rounded-lg">
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity">
                            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="brochureManager.deleteImage('${url}')" 
                                        class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    this.imagePreviewGrid.appendChild(div);
                });
            } else {
                this.imagePreviewGrid.innerHTML = '<p class="text-gray-500 text-center p-4">No images uploaded yet.</p>';
            }
        } catch (error) {
            console.error('Error refreshing image grid:', error);
            showToast('Error loading images', 'error');
        }
    }

    async deleteImage(urlToDelete) {
        try {
            const doc = await db.collection('brochure').doc('images').get();
            if (doc.exists) {
                const images = doc.data().images.filter(url => url !== urlToDelete);
                await db.collection('brochure').doc('images').set({
                    images,
                    updatedAt: new Date().toISOString()
                });
                showToast('Image deleted successfully!');
                await this.refreshImageGrid();
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            showToast('Error deleting image', 'error');
        }
    }

    async loadInitialData() {
        try {
            // Load company description
            const descDoc = await db.collection('brochure').doc('description').get();
            if (descDoc.exists) {
                this.companyDescription.value = descDoc.data().content;
            }

            // Load brochure images
            await this.refreshImageGrid();
        } catch (error) {
            console.error('Error loading initial data:', error);
            showToast('Error loading data. Please refresh the page.', 'error');
        }
    }
}

// Initialize brochure manager
const brochureManager = new BrochureManager();
document.addEventListener('DOMContentLoaded', () => {
    brochureManager.loadInitialData();
});
