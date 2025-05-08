// DOM Elements
const companyDescription = document.getElementById('company-description');
const brochureGallery = document.getElementById('brochure-gallery');

// Firebase Configuration (same as admin.js)
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

// Load company description and brochure images
async function loadBrochureContent() {
    try {
        // Load company description
        const descDoc = await db.collection('brochure').doc('description').get();
        if (descDoc.exists) {
            companyDescription.textContent = descDoc.data().content;
        } else {
            companyDescription.textContent = 'Welcome to vCard Creator! Create and share professional digital business cards with ease.';
        }

        // Load brochure images
        const imagesDoc = await db.collection('brochure').doc('images').get();
        if (imagesDoc.exists && imagesDoc.data().images.length > 0) {
            renderGallery(imagesDoc.data().images);
        } else {
            renderDefaultGallery();
        }
    } catch (error) {
        console.error('Error loading brochure content:', error);
        companyDescription.textContent = 'Welcome to vCard Creator! Create and share professional digital business cards with ease.';
        renderDefaultGallery();
    }
}

// Render gallery with uploaded images
function renderGallery(images) {
    brochureGallery.innerHTML = '';
    
    images.forEach((imageUrl, index) => {
        const article = document.createElement('article');
        article.className = 'relative group overflow-hidden rounded-lg shadow-lg transform transition-transform hover:scale-105';
        
        article.innerHTML = `
            <div class="aspect-w-4 aspect-h-3">
                <img src="${imageUrl}" alt="Brochure image ${index + 1}" 
                     class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                     loading="lazy">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onclick="openLightbox('${imageUrl}')" class="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <i class="fas fa-expand-alt mr-2"></i>View
                    </button>
                </div>
            </div>
        `;
        
        brochureGallery.appendChild(article);
    });
}

// Render default gallery with placeholder images
function renderDefaultGallery() {
    const defaultImages = [
        'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
        'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg',
        'https://images.pexels.com/photos/3182777/pexels-photo-3182777.jpeg'
    ];
    
    renderGallery(defaultImages);
}

// Lightbox functionality
function openLightbox(imageUrl) {
    const lightbox = document.createElement('div');
    lightbox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300';
    
    lightbox.innerHTML = `
        <div class="relative max-w-4xl mx-auto p-4">
            <button onclick="this.closest('.fixed').remove()" class="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl">
                <i class="fas fa-times"></i>
            </button>
            <img src="${imageUrl}" alt="Enlarged view" class="max-h-[80vh] mx-auto rounded-lg shadow-2xl">
        </div>
    `;
    
    // Add click event to close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.remove();
        }
    });
    
    document.body.appendChild(lightbox);
    
    // Trigger fade in animation
    requestAnimationFrame(() => {
        lightbox.style.opacity = '1';
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBrochureContent();
    
    // Add scroll animation for features
    const features = document.querySelectorAll('#features .bg-white');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    features.forEach(feature => {
        feature.style.opacity = '0';
        observer.observe(feature);
    });
});

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Handle contact form submission
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };
        
        try {
            await db.collection('contact_messages').add(data);
            showToast('Message sent successfully! We\'ll get back to you soon.');
            contactForm.reset();
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Error sending message. Please try again.', 'error');
        }
    });
}

// Toast notification helper
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
