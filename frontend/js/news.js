/**
 * NaTeSA News Management JavaScript
 * This file handles the functionality for the news management page
 */

// Constants
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let newsArticles = [];
let currentArticle = null;
let currentUser = null;

// DOM Elements
const newsContainer = document.getElementById('newsContainer');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const newsModal = document.getElementById('newsModal');
const confirmModal = document.getElementById('confirmModal');
const newsForm = document.getElementById('newsForm');
const modalTitle = document.getElementById('modalTitle');
const userInfo = document.querySelector('.user-info');
const logoutBtn = document.querySelector('.logout-btn');

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
    
    // Fetch news articles
    await fetchNews();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Fetch news articles from the API
 */
async function fetchNews() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/news`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch news articles');
        }
        
        newsArticles = await response.json();
        renderNews();
    } catch (error) {
        console.error('Error fetching news:', error);
        showErrorMessage('Failed to load news articles. Please try again later.');
    } finally {
        hideLoading();
    }
}

/**
 * Render news articles based on filters
 */
function renderNews() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    
    const filteredNews = newsArticles.filter(article => {
        const matchesSearch = 
            article.title.toLowerCase().includes(searchTerm) ||
            article.content.toLowerCase().includes(searchTerm) ||
            article.author.toLowerCase().includes(searchTerm);
            
        const matchesStatus = status === 'all' || article.status === status;
                            
        return matchesSearch && matchesStatus;
    });
    
    if (filteredNews.length === 0) {
        newsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>No news articles found</h3>
                <p>There are no news articles matching your criteria.</p>
                <button id="addFirstNewsBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Create Your First News Article
                </button>
            </div>
        `;
        
        document.getElementById('addFirstNewsBtn')?.addEventListener('click', () => {
            openNewsModal();
        });
        return;
    }
    
    newsContainer.innerHTML = filteredNews.map(article => createNewsCard(article)).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-news').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const articleId = btn.dataset.id;
            editNews(articleId);
        });
    });
    
    document.querySelectorAll('.delete-news').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const articleId = btn.dataset.id;
            confirmDelete(articleId);
        });
    });
    
    // Add click event to news cards
    document.querySelectorAll('.news-card').forEach(card => {
        card.addEventListener('click', () => {
            const articleId = card.dataset.id;
            viewNews(articleId);
        });
    });
}

/**
 * Create a news card HTML
 */
function createNewsCard(article) {
    const publishDate = new Date(article.publishDate);
    
    return `
        <div class="news-card" data-id="${article.id}">
            <div class="news-header">
                <div class="news-status status-${article.status}">${article.status}</div>
                <h3 class="news-title">${escapeHtml(article.title)}</h3>
                <div class="news-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formatDate(publishDate)}
                </div>
            </div>
            <div class="news-body">
                <div class="news-author">
                    <i class="fas fa-user"></i>
                    ${escapeHtml(article.author || 'Unknown')}
                </div>
                <p class="news-content">
                    ${truncateText(escapeHtml(article.content || 'No content provided.'), 150)}
                </p>
                <div class="news-actions">
                    <button class="btn btn-sm btn-primary edit-news" data-id="${article.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-news" data-id="${article.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Open the news modal for creating/editing an article
 */
function openNewsModal(article = null) {
    currentArticle = article;
    
    if (article) {
        // Edit mode
        modalTitle.textContent = 'Edit News Article';
        document.getElementById('newsId').value = article.id;
        document.getElementById('newsTitle').value = article.title;
        document.getElementById('newsDate').value = formatDateForInput(new Date(article.publishDate));
        document.getElementById('newsAuthor').value = article.author || '';
        document.getElementById('newsContent').value = article.content || '';
        document.getElementById('newsStatus').value = article.status || 'published';
    } else {
        // Create mode
        modalTitle.textContent = 'Add News Article';
        newsForm.reset();
        
        // Set default date to today
        const today = new Date();
        document.getElementById('newsDate').value = formatDateForInput(today);
    }
    
    // Show the modal
    newsModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Handle form submission
 */
async function handleNewsSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(newsForm);
    const newsData = {
        title: formData.get('title'),
        publishDate: formData.get('publishDate'),
        author: formData.get('author'),
        content: formData.get('content'),
        status: formData.get('status')
    };
    
    try {
        showLoading();
        
        if (currentArticle) {
            // Update existing article
            const response = await fetch(`${API_BASE_URL}/news/${currentArticle.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(newsData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update news article');
            }
            
            const updatedArticle = await response.json();
            // Update the article in the local state
            const index = newsArticles.findIndex(a => a.id === updatedArticle.id);
            if (index !== -1) {
                newsArticles[index] = updatedArticle;
            }
            
            showSuccessMessage('News article updated successfully');
        } else {
            // Create new article
            const response = await fetch(`${API_BASE_URL}/news`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(newsData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create news article');
            }
            
            const newArticle = await response.json();
            newsArticles.unshift(newArticle);
            showSuccessMessage('News article created successfully');
        }
        
        // Refresh the news list
        renderNews();
        closeModal();
    } catch (error) {
        console.error('Error saving news article:', error);
        showErrorMessage('Failed to save news article. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * Edit a news article
 */
function editNews(articleId) {
    const article = newsArticles.find(a => a.id.toString() === articleId.toString());
    if (article) {
        openNewsModal(article);
    }
}

/**
 * View news article details
 */
function viewNews(articleId) {
    // In a real app, you might navigate to a dedicated news detail page
    const article = newsArticles.find(a => a.id.toString() === articleId.toString());
    if (article) {
        // For now, just show an alert with the article details
        alert(`${article.title}\n\nBy: ${article.author || 'Unknown'}\nPublished: ${formatDate(new Date(article.publishDate))}\n\n${article.content || 'No content provided.'}`);
    }
}

/**
 * Confirm news article deletion
 */
function confirmDelete(articleId) {
    const article = newsArticles.find(a => a.id.toString() === articleId.toString());
    if (!article) return;
    
    const confirmMessage = document.getElementById('confirmMessage');
    confirmMessage.textContent = `Are you sure you want to delete the news article "${escapeHtml(article.title)}"? This action cannot be undone.`;
    
    const confirmBtn = document.getElementById('confirmAction');
    
    // Remove any existing event listeners to prevent duplicates
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
        await deleteNews(articleId);
        closeModal();
    });
    
    // Show the confirmation modal
    confirmModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Delete a news article
 */
async function deleteNews(articleId) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/news/${articleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete news article');
        }
        
        // Remove the article from the local state
        newsArticles = newsArticles.filter(article => article.id.toString() !== articleId.toString());
        
        // Refresh the news list
        renderNews();
        showSuccessMessage('News article deleted successfully');
    } catch (error) {
        console.error('Error deleting news article:', error);
        showErrorMessage('Failed to delete news article. Please try again.');
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
    currentArticle = null;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Search and filter
    searchInput.addEventListener('input', debounce(renderNews, 300));
    statusFilter.addEventListener('change', renderNews);
    
    // Add news button
    document.getElementById('addNewsBtn')?.addEventListener('click', () => openNewsModal());
    
    // Form submission
    newsForm.addEventListener('submit', handleNewsSubmit);
    
    // Modal close buttons
    document.querySelectorAll('.btn-close, #cancelNews, #cancelConfirm').forEach(btn => {
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
 * Format date for input field
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
window.editNews = editNews;
window.deleteNews = deleteNews;
window.viewNews = viewNews;