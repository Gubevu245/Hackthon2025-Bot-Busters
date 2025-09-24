/**
 * NaTeSA Resources Management JavaScript
 * This file handles the functionality for the resources management page
 */

// Constants
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let resources = [];
let currentResource = null;
let currentUser = null;
let selectedFile = null;

// DOM Elements
const resourcesContainer = document.getElementById('resourcesContainer');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const categoryFilter = document.getElementById('categoryFilter');
const resourceModal = document.getElementById('resourceModal');
const confirmModal = document.getElementById('confirmModal');
const resourceForm = document.getElementById('resourceForm');
const modalTitle = document.getElementById('modalTitle');
const userInfo = document.querySelector('.user-info');
const logoutBtn = document.querySelector('.logout-btn');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('resourceFile');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');
const linkGroup = document.getElementById('linkGroup');
const fileUploadGroup = document.getElementById('fileUploadGroup');
const resourceType = document.getElementById('resourceType');

// Initialize the page
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    if (!protectRoute()) return;
    
    // Get current user data
    currentUser = await getCurrentUser();
    if (!currentUser) {
        logout();
        return;
    }
    
    // Update UI with user info
    updateUserInfo(currentUser);
    
    // Fetch resources
    await fetchResources();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Fetch resources from the API
 */
async function fetchResources() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/resources`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }
        
        resources = await response.json();
        renderResources();
    } catch (error) {
        console.error('Error fetching resources:', error);
        showErrorMessage('Failed to load resources. Please try again later.');
    } finally {
        hideLoading();
    }
}

/**
 * Render resources based on filters
 */
function renderResources() {
    const searchTerm = searchInput.value.toLowerCase();
    const type = typeFilter.value;
    const category = categoryFilter.value;
    
    const filteredResources = resources.filter(resource => {
        const matchesSearch = 
            resource.title.toLowerCase().includes(searchTerm) ||
            resource.description.toLowerCase().includes(searchTerm);
            
        const matchesType = type === 'all' || resource.type === type;
        const matchesCategory = category === 'all' || resource.category === category;
                            
        return matchesSearch && matchesType && matchesCategory;
    });
    
    if (filteredResources.length === 0) {
        resourcesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <h3>No resources found</h3>
                <p>There are no resources matching your criteria.</p>
                <button id="addFirstResourceBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Add Your First Resource
                </button>
            </div>
        `;
        
        document.getElementById('addFirstResourceBtn')?.addEventListener('click', () => {
            openResourceModal();
        });
        return;
    }
    
    resourcesContainer.innerHTML = filteredResources.map(resource => createResourceCard(resource)).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-resource').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const resourceId = btn.dataset.id;
            editResource(resourceId);
        });
    });
    
    document.querySelectorAll('.delete-resource').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const resourceId = btn.dataset.id;
            confirmDelete(resourceId);
        });
    });
    
    // Add click event to resource cards
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', () => {
            const resourceId = card.dataset.id;
            viewResource(resourceId);
        });
    });
}

/**
 * Create a resource card HTML
 */
function createResourceCard(resource) {
    const createdDate = new Date(resource.createdAt);
    const fileSize = resource.fileSize ? formatFileSize(resource.fileSize) : '';
    
    let downloadLink = '';
    if (resource.type === 'document' || resource.type === 'presentation') {
        downloadLink = `
            <a href="${resource.fileUrl || '#'}" class="resource-download" target="_blank">
                <i class="fas fa-download"></i> Download
                <span class="resource-size">${fileSize}</span>
            </a>
        `;
    } else if (resource.type === 'link' || resource.type === 'video') {
        downloadLink = `
            <a href="${resource.url || '#'}" class="resource-download" target="_blank">
                <i class="fas fa-external-link-alt"></i> Open Link
            </a>
        `;
    }
    
    return `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-header">
                <div class="resource-type type-${resource.type}">${resource.type}</div>
                <h3 class="resource-title">${escapeHtml(resource.title)}</h3>
                <div class="resource-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formatDate(createdDate)}
                </div>
            </div>
            <div class="resource-body">
                <div class="resource-category">
                    <i class="fas fa-tag"></i>
                    ${escapeHtml(resource.category || 'Uncategorized')}
                </div>
                <p class="resource-description">
                    ${truncateText(escapeHtml(resource.description || 'No description provided.'), 120)}
                </p>
                ${downloadLink}
                <div class="resource-actions">
                    <button class="btn btn-sm btn-primary edit-resource" data-id="${resource.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-resource" data-id="${resource.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Open the resource modal for creating/editing a resource
 */
function openResourceModal(resource = null) {
    currentResource = resource;
    
    // Reset file selection
    selectedFile = null;
    filePreview.style.display = 'none';
    
    if (resource) {
        // Edit mode
        modalTitle.textContent = 'Edit Resource';
        document.getElementById('resourceId').value = resource.id;
        document.getElementById('resourceTitle').value = resource.title;
        document.getElementById('resourceType').value = resource.type || 'document';
        document.getElementById('resourceCategory').value = resource.category || 'academic';
        document.getElementById('resourceLink').value = resource.url || '';
        document.getElementById('resourceDescription').value = resource.description || '';
        
        // Toggle URL/file upload fields based on resource type
        toggleResourceTypeFields(resource.type);
    } else {
        // Create mode
        modalTitle.textContent = 'Add Resource';
        resourceForm.reset();
        
        // Default to document type
        toggleResourceTypeFields('document');
    }
    
    // Show the modal
    resourceModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Toggle URL/file upload fields based on resource type
 */
function toggleResourceTypeFields(type) {
    if (type === 'link' || type === 'video') {
        linkGroup.style.display = 'block';
        fileUploadGroup.style.display = 'none';
    } else {
        linkGroup.style.display = 'none';
        fileUploadGroup.style.display = 'block';
    }
}

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showErrorMessage('File size exceeds 10MB limit');
        return;
    }
    
    // Update file preview
    selectedFile = file;
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    filePreview.style.display = 'flex';
}

/**
 * Handle form submission
 */
async function handleResourceSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('resourceTitle').value);
    formData.append('type', document.getElementById('resourceType').value);
    formData.append('category', document.getElementById('resourceCategory').value);
    formData.append('description', document.getElementById('resourceDescription').value);
    
    const type = document.getElementById('resourceType').value;
    
    if (type === 'link' || type === 'video') {
        const url = document.getElementById('resourceLink').value;
        if (!url) {
            showErrorMessage('URL is required for links and videos');
            return;
        }
        formData.append('url', url);
    } else if (selectedFile || currentResource) {
        if (selectedFile) {
            formData.append('file', selectedFile);
        }
    } else {
        showErrorMessage('Please upload a file');
        return;
    }
    
    try {
        showLoading();
        
        let response;
        
        if (currentResource) {
            // Update existing resource
            formData.append('id', currentResource.id);
            
            response = await fetch(`${API_BASE_URL}/resources/${currentResource.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to update resource');
            }
            
            const updatedResource = await response.json();
            // Update the resource in the local state
            const index = resources.findIndex(r => r.id === updatedResource.id);
            if (index !== -1) {
                resources[index] = updatedResource;
            }
            
            showSuccessMessage('Resource updated successfully');
        } else {
            // Create new resource
            response = await fetch(`${API_BASE_URL}/resources`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to create resource');
            }
            
            const newResource = await response.json();
            resources.unshift(newResource);
            showSuccessMessage('Resource created successfully');
        }
        
        // Refresh the resources list
        renderResources();
        closeModal();
    } catch (error) {
        console.error('Error saving resource:', error);
        showErrorMessage('Failed to save resource. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * Edit a resource
 */
function editResource(resourceId) {
    const resource = resources.find(r => r.id.toString() === resourceId.toString());
    if (resource) {
        openResourceModal(resource);
    }
}

/**
 * View resource details
 */
function viewResource(resourceId) {
    const resource = resources.find(r => r.id.toString() === resourceId.toString());
    if (!resource) return;
    
    if (resource.type === 'link' || resource.type === 'video') {
        // Open the URL in a new tab
        window.open(resource.url, '_blank');
    } else if (resource.fileUrl) {
        // Open the file in a new tab
        window.open(resource.fileUrl, '_blank');
    } else {
        // Show resource details
        alert(`${resource.title}\n\nType: ${resource.type}\nCategory: ${resource.category}\n\n${resource.description || 'No description provided.'}`);
    }
}

/**
 * Confirm resource deletion
 */
function confirmDelete(resourceId) {
    const resource = resources.find(r => r.id.toString() === resourceId.toString());
    if (!resource) return;
    
    const confirmMessage = document.getElementById('confirmMessage');
    confirmMessage.textContent = `Are you sure you want to delete the resource "${escapeHtml(resource.title)}"? This action cannot be undone.`;
    
    const confirmBtn = document.getElementById('confirmAction');
    
    // Remove any existing event listeners to prevent duplicates
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
        await deleteResource(resourceId);
        closeModal();
    });
    
    // Show the confirmation modal
    confirmModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Delete a resource
 */
async function deleteResource(resourceId) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete resource');
        }
        
        // Remove the resource from the local state
        resources = resources.filter(resource => resource.id.toString() !== resourceId.toString());
        
        // Refresh the resources list
        renderResources();
        showSuccessMessage('Resource deleted successfully');
    } catch (error) {
        console.error('Error deleting resource:', error);
        showErrorMessage('Failed to delete resource. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * Close the currently open modal
 */
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = 'auto';
    currentResource = null;
    selectedFile = null;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Search and filter
    searchInput.addEventListener('input', debounce(renderResources, 300));
    typeFilter.addEventListener('change', renderResources);
    categoryFilter.addEventListener('change', renderResources);
    
    // Add resource button
    document.getElementById('addResourceBtn')?.addEventListener('click', () => openResourceModal());
    
    // Form submission
    resourceForm.addEventListener('submit', handleResourceSubmit);
    
    // Resource type change
    resourceType.addEventListener('change', (e) => {
        toggleResourceTypeFields(e.target.value);
    });
    
    // File upload
    if (dropZone) {
        // Click to browse
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('active');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('active');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('active');
            
            if (e.dataTransfer.files.length) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });
        
        // Remove file
        removeFile.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedFile = null;
            fileInput.value = '';
            filePreview.style.display = 'none';
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.btn-close, #cancelResource, #cancelConfirm').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Logout button
    logoutBtn?.addEventListener('click', logout);
}

/**
 * Update user info in the UI
 */
function updateUserInfo(user) {
    if (!userInfo) return;
    
    const userName = document.createElement('span');
    userName.className = 'user-name';
    userName.textContent = user.name || user.email;
    
    // Clear existing content and add the new content
    userInfo.innerHTML = '';
    userInfo.appendChild(userName);
    userInfo.appendChild(logoutBtn);
}

/**
 * Show loading state
 */
function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-overlay';
    loadingElement.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingElement);
}

/**
 * Hide loading state
 */
function hideLoading() {
    const loadingElement = document.querySelector('.loading-overlay');
    if (loadingElement) {
        loadingElement.remove();
    }
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    showToast(message, 'success');
}

/**
 * Show error message
 */
function showErrorMessage(message) {
    showToast(message, 'error');
}

/**
 * Format date for display
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Truncate text to a certain length
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Debounce function to limit how often a function can be called
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions available globally for HTML onclick handlers
window.editResource = editResource;
window.deleteResource = deleteResource;
window.viewResource = viewResource;