// Local Storage Configuration
const storage = {
    // Save data to localStorage
    setItem: async (collection, id, data) => {
        const key = `${collection}_${id}`;
        localStorage.setItem(key, JSON.stringify(data));
        
        // Update collection index
        const index = JSON.parse(localStorage.getItem(`${collection}_index`) || '[]');
        if (!index.includes(id)) {
            index.push(id);
            localStorage.setItem(`${collection}_index`, JSON.stringify(index));
        }
        return { id };
    },

    // Get data from localStorage
    getItem: async (collection, id) => {
        const key = `${collection}_${id}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    // Get all items from a collection
    getCollection: async (collection) => {
        const index = JSON.parse(localStorage.getItem(`${collection}_index`) || '[]');
        const items = [];
        for (const id of index) {
            const item = await storage.getItem(collection, id);
            if (item) {
                items.push({ id, ...item });
            }
        }
        return items;
    },

    // Delete item from localStorage
    deleteItem: async (collection, id) => {
        const key = `${collection}_${id}`;
        localStorage.removeItem(key);
        
        // Update collection index
        const index = JSON.parse(localStorage.getItem(`${collection}_index`) || '[]');
        const newIndex = index.filter(item => item !== id);
        localStorage.setItem(`${collection}_index`, JSON.stringify(newIndex));
    },

    // Upload file and return URL
    uploadFile: async (file, folder) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const id = Date.now().toString();
                const url = reader.result;
                const key = `${folder}_${id}`;
                localStorage.setItem(key, url);
                
                // Update files index
                const index = JSON.parse(localStorage.getItem(`${folder}_files`) || '[]');
                index.push(id);
                localStorage.setItem(`${folder}_files`, JSON.stringify(index));
                
                resolve({ url, id });
            };
            reader.readAsDataURL(file);
        });
    },

    // Get file URL
    getFileUrl: (folder, id) => {
        const key = `${folder}_${id}`;
        return localStorage.getItem(key);
    },

    // Delete file
    deleteFile: (folder, id) => {
        const key = `${folder}_${id}`;
        localStorage.removeItem(key);
        
        // Update files index
        const index = JSON.parse(localStorage.getItem(`${folder}_files`) || '[]');
        const newIndex = index.filter(item => item !== id);
        localStorage.setItem(`${folder}_files`, JSON.stringify(newIndex));
    }
};

// Database operations
const db = {
    collection: (name) => ({
        doc: (id) => ({
            get: async () => {
                const data = await storage.getItem(name, id);
                return {
                    exists: !!data,
                    data: () => data,
                    id
                };
            },
            set: async (data) => storage.setItem(name, id, data),
            update: async (data) => {
                const existing = await storage.getItem(name, id);
                return storage.setItem(name, id, { ...existing, ...data });
            }
        }),
        add: async (data) => {
            const id = Date.now().toString();
            await storage.setItem(name, id, data);
            return { id };
        },
        get: async () => {
            const items = await storage.getCollection(name);
            return {
                docs: items.map(item => ({
                    id: item.id,
                    data: () => {
                        const { id, ...data } = item;
                        return data;
                    }
                }))
            };
        }
    })
};

// Toast notification helper
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 bg-white text-gray-900 px-6 py-4 rounded-lg shadow-lg transform translate-y-full opacity-0 transition-all duration-300 ${type === 'error' ? 'toast-error' : 'toast-success'}`;
    
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

// Copy to clipboard helper
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showToast('Copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy to clipboard', 'error');
        });
}
