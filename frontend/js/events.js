/**
 * NaTeSA Events Management JavaScript
 * This file handles the functionality for the events management page
 */

// Constants
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let events = [];
let currentEvent = null;
let currentUser = null;

// DOM Elements
const eventsContainer = document.getElementById('eventsContainer');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const eventModal = document.getElementById('eventModal');
const confirmModal = document.getElementById('confirmModal');
const eventForm = document.getElementById('eventForm');
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
    
    // Fetch events
    await fetchEvents();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Fetch events from the API
 */
async function fetchEvents() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/events`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        
        events = await response.json();
        renderEvents();
    } catch (error) {
        console.error('Error fetching events:', error);
        showErrorMessage('Failed to load events. Please try again later.');
    } finally {
        hideLoading();
    }
}

/**
 * Render events based on filters
 */
function renderEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    
    const filteredEvents = events.filter(event => {
        const matchesSearch = 
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm);
            
        const matchesStatus = status === 'all' || 
                            (status === 'upcoming' && new Date(event.endDate) > new Date()) ||
                            (status === 'past' && new Date(event.endDate) < new Date()) ||
                            (status === 'draft' && event.status === 'draft');
                            
        return matchesSearch && matchesStatus;
    });
    
    if (filteredEvents.length === 0) {
        eventsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <h3>No events found</h3>
                <p>There are no events matching your criteria.</p>
                <button id="addFirstEventBtn" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Create Your First Event
                </button>
            </div>
        `;
        
        document.getElementById('addFirstEventBtn')?.addEventListener('click', () => {
            openEventModal();
        });
        return;
    }
    
    eventsContainer.innerHTML = filteredEvents.map(event => createEventCard(event)).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = btn.dataset.id;
            editEvent(eventId);
        });
    });
    
    document.querySelectorAll('.delete-event').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = btn.dataset.id;
            confirmDelete(eventId);
        });
    });
    
    // Add click event to event cards
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.id;
            viewEvent(eventId);
        });
    });
}

/**
 * Create an event card HTML
 */
function createEventCard(event) {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const now = new Date();
    const isPastEvent = endDate < now;
    const status = isPastEvent ? 'past' : (event.status || 'upcoming');
    
    return `
        <div class="event-card" data-id="${event.id}">
            <div class="event-header">
                <div class="event-status status-${status}">${status}</div>
                <h3 class="event-title">${escapeHtml(event.title)}</h3>
                <div class="event-date">
                    <i class="far fa-calendar-alt"></i>
                    ${formatDate(startDate)} • ${formatTime(startDate)} - ${formatTime(endDate)}
                </div>
            </div>
            <div class="event-body">
                <div class="event-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${escapeHtml(event.location || 'Location not specified')}
                </div>
                <p class="event-description">
                    ${truncateText(escapeHtml(event.description || 'No description provided.'), 120)}
                </p>
                <div class="event-actions">
                    <button class="btn btn-sm btn-primary edit-event" data-id="${event.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger delete-event" data-id="${event.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Open the event modal for creating/editing an event
 */
function openEventModal(event = null) {
    currentEvent = event;
    
    if (event) {
        // Edit mode
        modalTitle.textContent = 'Edit Event';
        document.getElementById('eventId').value = event.id;
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventStartDate').value = formatDateTimeForInput(new Date(event.startDate));
        document.getElementById('eventEndDate').value = formatDateTimeForInput(new Date(event.endDate));
        document.getElementById('eventLocation').value = event.location || '';
        document.getElementById('eventDescription').value = event.description || '';
        document.getElementById('eventStatus').value = event.status || 'upcoming';
    } else {
        // Create mode
        modalTitle.textContent = 'Add New Event';
        eventForm.reset();
        
        // Set default start and end times (now and 1 hour later)
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        
        document.getElementById('eventStartDate').value = formatDateTimeForInput(now);
        document.getElementById('eventEndDate').value = formatDateTimeForInput(oneHourLater);
    }
    
    // Show the modal
    eventModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Handle form submission
 */
async function handleEventSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(eventForm);
    const eventData = {
        title: formData.get('title'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        location: formData.get('location'),
        description: formData.get('description'),
        status: formData.get('status')
    };
    
    // Validate dates
    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    
    if (startDate >= endDate) {
        showErrorMessage('End date must be after start date');
        return;
    }
    
    try {
        showLoading();
        
        if (currentEvent) {
            // Update existing event
            const response = await fetch(`${API_BASE_URL}/events/${currentEvent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update event');
            }
            
            const updatedEvent = await response.json();
            // Update the event in the local state
            const index = events.findIndex(e => e.id === updatedEvent.id);
            if (index !== -1) {
                events[index] = updatedEvent;
            }
            
            showSuccessMessage('Event updated successfully');
        } else {
            // Create new event
            const response = await fetch(`${API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create event');
            }
            
            const newEvent = await response.json();
            events.unshift(newEvent);
            showSuccessMessage('Event created successfully');
        }
        
        // Refresh the events list
        renderEvents();
        closeModal();
    } catch (error) {
        console.error('Error saving event:', error);
        showErrorMessage('Failed to save event. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * Edit an event
 */
function editEvent(eventId) {
    const event = events.find(e => e.id.toString() === eventId.toString());
    if (event) {
        openEventModal(event);
    }
}

/**
 * View event details
 */
function viewEvent(eventId) {
    // In a real app, you might navigate to a dedicated event detail page
    const event = events.find(e => e.id.toString() === eventId.toString());
    if (event) {
        // For now, just show an alert with the event details
        alert(`Event: ${event.title}\n\n${event.description || 'No description'}\n\nLocation: ${event.location || 'Not specified'}\nStarts: ${formatDateTime(new Date(event.startDate))}\nEnds: ${formatDateTime(new Date(event.endDate))}`);
    }
}

/**
 * Confirm event deletion
 */
function confirmDelete(eventId) {
    const event = events.find(e => e.id.toString() === eventId.toString());
    if (!event) return;
    
    const confirmMessage = document.getElementById('confirmMessage');
    confirmMessage.textContent = `Are you sure you want to delete the event "${escapeHtml(event.title)}"? This action cannot be undone.`;
    
    const confirmBtn = document.getElementById('confirmAction');
    
    // Remove any existing event listeners to prevent duplicates
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
        await deleteEvent(eventId);
        closeModal();
    });
    
    // Show the confirmation modal
    confirmModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Delete an event
 */
async function deleteEvent(eventId) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete event');
        }
        
        // Remove the event from the local state
        events = events.filter(event => event.id.toString() !== eventId.toString());
        
        // Refresh the events list
        renderEvents();
        showSuccessMessage('Event deleted successfully');
    } catch (error) {
        console.error('Error deleting event:', error);
        showErrorMessage('Failed to delete event. Please try again.');
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
    currentEvent = null;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Search and filter
    searchInput.addEventListener('input', debounce(renderEvents, 300));
    statusFilter.addEventListener('change', renderEvents);
    
    // Add event button
    document.getElementById('addEventBtn')?.addEventListener('click', () => openEventModal());
    
    // Form submission
    eventForm.addEventListener('submit', handleEventSubmit);
    
    // Modal close buttons
    document.querySelectorAll('.btn-close, #cancelEvent, #cancelConfirm').forEach(btn => {
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
        month: 'short',
        day: 'numeric',
        weekday: 'short'
    });
}

/**
 * Format time for display
 */
function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Format date and time for display
 */
function formatDateTime(date) {
    return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Format date for datetime-local input
 */
function formatDateTimeForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
