// DOM Elements
const searchInput = document.getElementById('search');
const filterStatus = document.getElementById('filter-status');
const tableBody = document.getElementById('vcards-table-body');

// State
let vcards = [];
let filteredVcards = [];
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    loadVCards();
    setupEventListeners();
});

// Load vCards from localStorage
function loadVCards() {
    vcards = JSON.parse(localStorage.getItem('vcards') || '[]');
    filteredVcards = [...vcards];
    renderVCards();
}

// Setup event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    filterStatus.addEventListener('change', handleFilter);
    
    // Delegate table actions
    tableBody.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        const row = target.closest('tr');
        const id = row.dataset.id;
        
        if (target.classList.contains('edit-btn')) {
            handleEdit(id);
        } else if (target.classList.contains('delete-btn')) {
            handleDelete(id);
        }
    });
}

// Handle search
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filterVCards();
}

// Handle status filter
function handleFilter() {
    filterVCards();
}

// Filter vCards based on search and status
function filterVCards() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterStatus.value;
    
    filteredVcards = vcards.filter(card => {
        const matchesSearch = 
            card.fullName.toLowerCase().includes(searchTerm) ||
            card.company.toLowerCase().includes(searchTerm) ||
            card.email.toLowerCase().includes(searchTerm);
            
        const matchesStatus = !statusFilter || card.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    renderVCards();
}

// Render vCards table
function renderVCards() {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedVCards = filteredVcards.slice(start, end);
    
    tableBody.innerHTML = paginatedVCards.map(card => `
        <tr data-id="${card.id}">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                        ${card.photo 
                            ? `<img class="h-10 w-10 rounded-full" src="${card.photo}" alt="${card.fullName}">`
                            : `<div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <i class="fas fa-user text-gray-400"></i>
                               </div>`
                        }
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${card.fullName}</div>
                        <div class="text-sm text-gray-500">${card.jobTitle}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${card.company}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${card.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    card.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }">
                    ${card.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(card.createdAt).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="edit-btn text-indigo-600 hover:text-indigo-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    updatePagination();
}

// Update pagination info and controls
function updatePagination() {
    const totalItems = filteredVcards.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(start + ITEMS_PER_PAGE - 1, totalItems);
    
    document.querySelector('.text-sm.text-gray-700').innerHTML = `
        Showing <span class="font-medium">${start}</span> to 
        <span class="font-medium">${end}</span> of 
        <span class="font-medium">${totalItems}</span> results
    `;
    
    // Update pagination buttons
    const paginationNav = document.querySelector('nav[aria-label="Pagination"]');
    let paginationHTML = `
        <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <span class="sr-only">Previous</span>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="${i === currentPage ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
                onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <span class="sr-only">Next</span>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationNav.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredVcards.length / ITEMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderVCards();
    }
}

// Handle edit vCard
function handleEdit(id) {
    const card = vcards.find(c => c.id === parseInt(id));
    if (!card) return;
    
    // For now, just toggle status
    card.status = card.status === 'active' ? 'inactive' : 'active';
    localStorage.setItem('vcards', JSON.stringify(vcards));
    renderVCards();
}

// Handle delete vCard
function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this vCard?')) return;
    
    const index = vcards.findIndex(c => c.id === parseInt(id));
    if (index === -1) return;
    
    vcards.splice(index, 1);
    localStorage.setItem('vcards', JSON.stringify(vcards));
    filterVCards();
}

// Make changePage function global for onclick handlers
window.changePage = changePage;
