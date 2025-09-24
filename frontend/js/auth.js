// Authentication utilities for NaTeSA frontend
// Import API_BASE_URL from config.js
// The script tag for config.js should be added before auth.js in HTML files

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('authToken');
}

// Get current user data
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid, log out
        logout();
        return null;
      }
      throw new Error('Failed to get user data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Register a new user
async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Registration failed');
    }

    const data = await response.json();

    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Login failed');
    }

    const data = await response.json();

    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userData', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout user
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');

  // Redirect to login page
  window.location.href = 'login.html';
}

// Get auth token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Get user data from localStorage
function getUserData() {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
}

// Check if user has specific role
function hasRole(role) {
  const userData = getUserData();
  return userData && userData.role === role;
}

// Protect route - redirect to login if not authenticated
function protectRoute() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Redirect if already logged in
function redirectIfLoggedIn(destination = 'index.html') {
  if (isLoggedIn()) {
    window.location.href = destination;
    return true;
  }
  return false;
}
