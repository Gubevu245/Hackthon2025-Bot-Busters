// Configuration file for NaTeSA frontend
// This file centralizes configuration settings for the application

// API URL Configuration
// In development: Use local server
// In production: Use Netlify Functions
const API_CONFIG = {
  // Get the appropriate API URL based on environment
  getApiUrl: function() {
    // Check if we're in a Netlify environment
    if (window.location.hostname.includes('netlify.app')) {
      // Use the same domain as the frontend but with the Netlify Functions path
      // This works because both frontend and backend are deployed on the same Netlify site
      return '/api';  // This will be redirected to /.netlify/functions/api by Netlify
    }

    // Default to local development
    return 'http://localhost:3000/api';
  }
};

// Export the API base URL for use in other files
const API_BASE_URL = API_CONFIG.getApiUrl();
