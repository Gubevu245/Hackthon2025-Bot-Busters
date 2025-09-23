document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();


  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  if (email === '' || password === '') {
    alert('Please fill in both fields');
    return;
  }

  alert('Login successful (placeholder)');
});