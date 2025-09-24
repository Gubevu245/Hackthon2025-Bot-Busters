/**
 * NaTeSA Member Management JavaScript
 * This file handles the functionality for the member management page
 */

// Constants
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let branches = []; // Store branches data
let members = [];  // Store active members
let alumni = [];   // Store alumni
let currentView = 'active'; // Current view: 'active' or 'alumni'
let editingMember = null; // Currently editing member ID
let editingAlumni = null; // Currently editing alumni ID

// Current user info (will be populated from auth.js)
let currentUser = null;

// DOM Elements
const membersGrid = document.getElementById('membersGrid');
const viewTabs = document.getElementById('viewTabs');
const searchInput = document.getElementById('searchInput');
const branchFilter = document.getElementById('branchFilter');
const roleFilter = document.getElementById('roleFilter');
const memberModal = document.getElementById('memberModal');
const graduateModal = document.getElementById('graduateModal');
const memberForm = document.getElementById('memberForm');
const graduateForm = document.getElementById('graduateForm');
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
    
    // Fetch data
    await Promise.all([
        fetchBranches(),
        fetchMembers(),
        fetchAlumni()
    ]);
    
    // Initialize UI
    populateSelects();
    renderTabs();
    renderData();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Fetch branches from API
 */
async function fetchBranches() {
    try {
        const response = await fetch(`${API_BASE_URL}/branches`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch branches');
        }
        
        branches = await response.json();
    } catch (error) {
        console.error('Error fetching branches:', error);
        showErrorMessage('Failed to load branches. Please try again later.');
    }
}

/**
 * Fetch members from API
 */
async function fetchMembers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch members');
        }
        
        const users = await response.json();
        // Filter out alumni
        members = users.filter(user => user.status !== 'alumni');
    } catch (error) {
        console.error('Error fetching members:', error);
        showErrorMessage('Failed to load members. Please try again later.');
    }
}

/**
 * Fetch alumni from API
 */
async function fetchAlumni() {
    try {
        const response = await fetch(`${API_BASE_URL}/alumni`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch alumni');
        }
        
        alumni = await response.json();
    } catch (error) {
        console.error('Error fetching alumni:', error);
        showErrorMessage('Failed to load alumni. Please try again later.');
    }
}

/**
 * Update user info in the UI
 */
function updateUserInfo(user) {
    if (!user) return;
    
    // Update user icon with initials
    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        const initials = user.name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        userIcon.textContent = initials;
    }
    
    // Update user name
    const userName = document.querySelector('.user-info span');
    if (userName) {
        userName.textContent = user.name;
    }
}

/**
 * Populate select dropdowns with branches
 */
function populateSelects() {
    if (!branchFilter || !document.getElementById('branch')) return;
    
    // Branch filter
    branchFilter.innerHTML = '<option>All branches</option>';
    
    // Modal branch select
    const modalBranchSelect = document.getElementById('branch');
    modalBranchSelect.innerHTML = '';
    
    // Add branches to both selects
    branches.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch.id;
        option.textContent = branch.university || branch.name;
        
        branchFilter.appendChild(option.cloneNode(true));
        modalBranchSelect.appendChild(option);
    });
}

/**
 * Render tabs with counts
 */
function renderTabs() {
    if (!viewTabs) return;
    
    const activeCount = members.length;
    const alumniCount = alumni.length;
    
    viewTabs.innerHTML = `
        <div class="tab ${currentView === 'active' ? 'active' : ''}" data-view="active">
            Active Members (${activeCount})
        </div>
        <div class="tab ${currentView === 'alumni' ? 'active' : ''}" data-view="alumni">
            Alumni (${alumniCount})
        </div>
    `;
}

/**
 * Get filtered data based on search and filters
 */
function getFilteredData() {
    let data = currentView === 'active' ? members : alumni;
    let filtered = [...data];
    
    // Permission filter: if not NEC, only show members from same branch
    if (currentUser && currentUser.role !== 'nec') {
        filtered = filtered.filter(item => {
            const branchId = item.branch_id || (item.Branch && item.Branch.id);
            return branchId === currentUser.branch_id;
        });
    }
    
    // Search filter
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    if (search) {
        filtered = filtered.filter(item => {
            const name = item.name || (item.User && item.User.name) || '';
            const email = item.email || (item.User && item.User.email) || '';
            return name.toLowerCase().includes(search) || 
                   email.toLowerCase().includes(search);
        });
    }
    
    // Branch filter
    const branch = branchFilter ? branchFilter.value : 'All branches';
    if (branch !== 'All branches') {
        filtered = filtered.filter(item => {
            const branchId = item.branch_id || (item.Branch && item.Branch.id);
            return branchId == branch;
        });
    }
    
    // Role filter
    const role = roleFilter ? roleFilter.value : 'All roles';
    if (role !== 'All roles') {
        filtered = filtered.filter(item => {
            const userRole = item.role || (item.User && item.User.role) || '';
            if (role === 'NEC') return userRole === 'nec';
            if (role === 'bec') return userRole === 'bec';
            if (role === 'General Member') return userRole === 'member';
            return true;
        });
    }
    
    return filtered;
}

/**
 * Render members or alumni data
 */
function renderData() {
    if (!membersGrid) return;
    
    const filtered = getFilteredData();
    
    if (currentView === 'active') {
        // Render active members
        membersGrid.innerHTML = filtered.map(member => {
            const displayRole = member.role === 'nec' ? 
                (member.nec_position || 'NEC Member') : 
                member.role === 'bec' ? 
                (member.bec_position || 'BEC Member') : 
                'General Member';
                
            const canMoveToAlumni = currentUser && 
                (currentUser.role === 'nec' || 
                (currentUser.role === 'bec' && currentUser.branch_id === member.branch_id));
                
            const branch = branches.find(b => b.id === member.branch_id);
            const university = branch ? (branch.university || branch.name) : 'Unknown';
            
            // Format dates
            const createdAt = new Date(member.createdAt).toLocaleDateString();
            const updatedAt = new Date(member.updatedAt).toLocaleDateString();
            
            return `
                <div class="member-card">
                    <div class="member-name">${member.name}</div>
                    <div class="member-email">${member.email}</div>
                    <div class="member-role">${displayRole}</div>
                    <div class="status">
                        <span class="status-badge"><i class="fas fa-circle"></i> ${member.status || 'active'}</span>
                    </div>
                    <div class="member-info">
                        <div><i class="fas fa-university icon"></i> ${university}</div>
                        <div><i class="far fa-calendar-alt icon"></i> Joined: ${createdAt}</div>
                        <div><i class="fas fa-clock icon"></i> Last updated: ${updatedAt}</div>
                    </div>
                    <div class="buttons">
                        <button class="btn btn-edit" onclick="editMember(${member.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${canMoveToAlumni ? 
                            `<button class="btn btn-move-alumni" onclick="moveToAlumni(${member.id})">
                                <i class="fas fa-user-graduate"></i> To Alumni
                            </button>` : ''}
                        <button class="btn btn-delete" onclick="deleteMember(${member.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        // Render alumni
        membersGrid.innerHTML = filtered.map(alum => {
            const user = alum.User || {};
            const branch = alum.Branch || branches.find(b => b.id === alum.branch_id) || {};
            
            const displayRole = user.role === 'nec' ? 'NEC' :
                               user.role === 'bec' ? 'BEC' : 'Member';
                               
            // Format dates
            const graduationDate = new Date(alum.graduation_date).toLocaleDateString();
            
            return `
                <div class="alumni-card">
                    <div class="member-name">${user.name || alum.name || 'Unknown'}</div>
                    <div class="member-email">${user.email || alum.email || 'Unknown'}</div>
                    <div class="member-role">${displayRole}</div>
                    <div class="status">
                        <span class="status-badge alumni-status-badge">
                            <i class="fas fa-circle"></i> alumni
                        </span>
                    </div>
                    <div class="member-info">
                        <div><i class="fas fa-university icon"></i> ${branch.university || branch.name || 'Unknown'}</div>
                        <div><i class="fas fa-graduation-cap icon"></i> Graduation: ${graduationDate}</div>
                        <div><i class="fas fa-certificate icon"></i> Degree: ${alum.degree || 'Unknown'}</div>
                        <div><i class="fas fa-briefcase icon"></i> Current: ${alum.current_status || 'Unknown'}</div>
                    </div>
                    <div class="buttons">
                        <button class="btn btn-edit" onclick="editAlumni(${alum.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="deleteAlumni(${alum.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Tab switching
    if (viewTabs) {
        viewTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                currentView = e.target.dataset.view;
                renderTabs();
                renderData();
            }
        });
    }
    
    // Search and filters
    if (searchInput) {
        searchInput.addEventListener('input', renderData);
    }
    
    if (branchFilter) {
        branchFilter.addEventListener('change', renderData);
    }
    
    if (roleFilter) {
        roleFilter.addEventListener('change', renderData);
    }
    
    // Member form submission
    if (memberForm) {
        memberForm.addEventListener('submit', handleMemberFormSubmit);
    }
    
    // Graduate form submission
    if (graduateForm) {
        graduateForm.addEventListener('submit', handleGraduateFormSubmit);
    }
    
    // Modal close buttons
    document.getElementById('closeModal')?.addEventListener('click', () => {
        memberModal.style.display = 'none';
    });
    
    document.getElementById('closeGraduate')?.addEventListener('click', () => {
        graduateModal.style.display = 'none';
    });
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        });
    }
}

/**
 * Handle member form submission
 */
async function handleMemberFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const branch_id = document.getElementById('branch').value;
    const password = document.getElementById('password').value;
    
    // Validate form
    if (!name || !email || !role || !branch_id) {
        showErrorMessage('Please fill in all required fields');
        return;
    }
    
    try {
        const userData = {
            name,
            email,
            role,
            branch_id: parseInt(branch_id),
            is_bec_member: role === 'bec',
            status: 'active'
        };
        
        // Add password for new users
        if (password) {
            userData.password = password;
        }
        
        let response;
        
        if (editingMember) {
            // Update existing user
            response = await fetch(`${API_BASE_URL}/users/${editingMember}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(userData)
            });
        }
        
        if (!response.ok) {
            throw new Error('Failed to save user');
        }
        
        // Close modal and refresh data
        memberModal.style.display = 'none';
        await fetchMembers();
        renderTabs();
        renderData();
        
        showSuccessMessage(editingMember ? 'Member updated successfully' : 'Member created successfully');
        
        // Reset form and editing state
        memberForm.reset();
        editingMember = null;
        
    } catch (error) {
        console.error('Error saving member:', error);
        showErrorMessage('Failed to save member. Please try again.');
    }
}

/**
 * Handle graduate form submission
 */
async function handleGraduateFormSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('graduateMemberId').value;
    const graduationDate = document.getElementById('graduationDate').value;
    const degree = document.getElementById('degree').value;
    const currentStatus = document.getElementById('currentStatus').value;
    
    // Validate form
    if (!userId || !graduationDate || !degree) {
        showErrorMessage('Please fill in all required fields');
        return;
    }
    
    try {
        // Get user data
        const userResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to get user data');
        }
        
        const user = await userResponse.json();
        
        // Create alumni record
        const alumniData = {
            user_id: parseInt(userId),
            branch_id: user.branch_id,
            graduation_date: graduationDate,
            degree,
            current_status: currentStatus
        };
        
        const response = await fetch(`${API_BASE_URL}/alumni`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(alumniData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create alumni record');
        }
        
        // Close modal and refresh data
        graduateModal.style.display = 'none';
        await Promise.all([fetchMembers(), fetchAlumni()]);
        renderTabs();
        renderData();
        
        showSuccessMessage('Member moved to alumni successfully');
        
        // Reset form
        graduateForm.reset();
        
    } catch (error) {
        console.error('Error moving to alumni:', error);
        showErrorMessage('Failed to move member to alumni. Please try again.');
    }
}

/**
 * Edit a member
 */
async function editMember(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get user data');
        }
        
        const user = await response.json();
        
        // Set form values
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('role').value = user.role || 'member';
        document.getElementById('branch').value = user.branch_id || '';
        
        // Hide password field for editing
        document.getElementById('passwordGroup').classList.add('hidden');
        
        // Set editing state
        editingMember = id;
        
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Edit Member';
        
        // Show modal
        memberModal.style.display = 'block';
        
    } catch (error) {
        console.error('Error getting member data:', error);
        showErrorMessage('Failed to load member data. Please try again.');
    }
}

/**
 * Move a member to alumni
 */
function moveToAlumni(id) {
    // Set the user ID in the graduate form
    document.getElementById('graduateMemberId').value = id;
    
    // Show the graduate modal
    graduateModal.style.display = 'block';
}

/**
 * Delete a member
 */
async function deleteMember(id) {
    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        
        // Refresh data
        await fetchMembers();
        renderTabs();
        renderData();
        
        showSuccessMessage('Member deleted successfully');
        
    } catch (error) {
        console.error('Error deleting member:', error);
        showErrorMessage('Failed to delete member. Please try again.');
    }
}

/**
 * Edit an alumni record
 */
async function editAlumni(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/alumni/${id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to get alumni data');
        }
        
        const alumni = await response.json();
        
        // Set form values in graduate form
        document.getElementById('graduateMemberId').value = alumni.user_id || '';
        document.getElementById('graduationDate').value = alumni.graduation_date ? 
            new Date(alumni.graduation_date).toISOString().split('T')[0] : '';
        document.getElementById('degree').value = alumni.degree || '';
        document.getElementById('currentStatus').value = alumni.current_status || '';
        
        // Set editing state
        editingAlumni = id;
        
        // Show modal
        graduateModal.style.display = 'block';
        
    } catch (error) {
        console.error('Error getting alumni data:', error);
        showErrorMessage('Failed to load alumni data. Please try again.');
    }
}

/**
 * Delete an alumni record
 */
async function deleteAlumni(id) {
    if (!confirm('Are you sure you want to delete this alumni record?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/alumni/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete alumni');
        }
        
        // Refresh data
        await fetchAlumni();
        renderTabs();
        renderData();
        
        showSuccessMessage('Alumni record deleted successfully');
        
    } catch (error) {
        console.error('Error deleting alumni:', error);
        showErrorMessage('Failed to delete alumni record. Please try again.');
    }
}

/**
 * Show a success message
 */
function showSuccessMessage(message) {
    alert(message); // Replace with better UI notification
}

/**
 * Show an error message
 */
function showErrorMessage(message) {
    alert('Error: ' + message); // Replace with better UI notification
}

// Make functions available globally for onclick handlers
window.editMember = editMember;
window.moveToAlumni = moveToAlumni;
window.deleteMember = deleteMember;
window.editAlumni = editAlumni;
window.deleteAlumni = deleteAlumni;