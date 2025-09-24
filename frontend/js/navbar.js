// Navbar functionality for NaTeSA frontend

document.addEventListener('DOMContentLoaded', function() {
  // Update navbar based on authentication state
  updateNavbar();
});

// Function to update navbar based on authentication state
function updateNavbar() {
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  // Check if user is logged in
  const isUserLoggedIn = isLoggedIn();

  // Get all login and register links
  const loginLinks = navLinks.querySelectorAll('a[href*="login.html"], a[href*="log in.html"]');
  const registerLinks = navLinks.querySelectorAll('a[href*="register.html"], a[href*="create-account.html"]');

  // Check if logout link already exists
  let logoutLink = navLinks.querySelector('a[href="#logout"]');

  // Find "Join NaTeSA" button in hero section
  const joinNatesaBtn = document.querySelector('.hero-buttons a[href*="register.html"]');

  if (isUserLoggedIn) {
    // Hide login and register links
    loginLinks.forEach(link => {
      link.parentElement.style.display = 'none';
    });

    registerLinks.forEach(link => {
      link.parentElement.style.display = 'none';
    });

    // Hide "Join NaTeSA" button if it exists
    if (joinNatesaBtn) {
      joinNatesaBtn.style.display = 'none';
    }

    // Add logout link if it doesn't exist
    if (!logoutLink) {
      const logoutLi = document.createElement('li');
      logoutLink = document.createElement('a');
      logoutLink.href = '#logout';
      logoutLink.textContent = 'Logout';
      logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
      logoutLi.appendChild(logoutLink);
      navLinks.appendChild(logoutLi);
    }
  } else {
    // Show login and register links
    loginLinks.forEach(link => {
      link.parentElement.style.display = '';
    });

    registerLinks.forEach(link => {
      link.parentElement.style.display = '';
    });

    // Show "Join NaTeSA" button if it exists
    if (joinNatesaBtn) {
      joinNatesaBtn.style.display = '';
    }

    // Remove logout link if it exists
    if (logoutLink) {
      logoutLink.parentElement.remove();
    }
  }
}
