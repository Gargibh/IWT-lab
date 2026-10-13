// public/js/login.js
// Handles login form submission and password visibility toggle.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  const alertBox = document.getElementById('form-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const identifier = form.identifier.value.trim();
    const password = form.password.value;
    const remember = form.remember.checked;

    if (!identifier || !password) {
      showAlert('Please enter both your username/email and password.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, remember })
      });
      const data = await res.json();

      if (data.success) {
        showAlert('Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = data.redirect || '/dashboard.html'; }, 800);
      } else {
        showAlert(data.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert show alert-${type}`;
  }

  function hideAlert() {
    alertBox.className = 'alert';
  }

  // Password visibility toggle
  const toggleBtn = document.querySelector('.toggle-pw');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const input = document.getElementById('password');
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
    });
  }

  // Forgot password link is UI-only per spec
  const forgotLink = document.getElementById('forgot-password');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset is not yet available. Please contact the department office.');
    });
  }
});
