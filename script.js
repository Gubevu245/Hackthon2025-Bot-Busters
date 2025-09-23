function validateLoginForm() {
  let isValid = true;

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  emailError.textContent = "";
  passwordError.textContent = "";

  const emailRegex = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

  if (email === "") {
    emailError.textContent = "Email is required.";
    isValid = false;
  } else if (!email.match(emailRegex)) {
    emailError.textContent = "Enter a valid email address.";
    isValid = false;
  }

  if (password === "") {
    passwordError.textContent = "Password is required.";
    isValid = false;
  } else if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    isValid = false;
  }

  return isValid;
}
