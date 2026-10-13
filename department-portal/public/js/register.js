// public/js/register.js
// Client-side validation + submission for the registration form.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  const alertBox = document.getElementById('form-alert');
  let usernameCheckTimeout = null;

  const usernameInput = document.getElementById('username');
  const usernameError = document.getElementById('username-error');

  // Live username uniqueness check (debounced)
  usernameInput.addEventListener('input', () => {
    clearTimeout(usernameCheckTimeout);
    const username = usernameInput.value.trim();
    usernameError.textContent = '';

    if (username.length < 3) return;

    usernameCheckTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (data.success && !data.available) {
          usernameError.textContent = 'This username is already taken.';
        }
      } catch (err) {
        console.error('Username check failed:', err);
      }
    }, 400);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    hideAlert();

    const values = {
      full_name: form.full_name.value.trim(),
      register_number: form.register_number.value.trim(),
      department: form.department.value,
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      gender: form.gender.value,
      dob: form.dob.value,
      year_of_study: form.year_of_study.value,
      username: form.username.value.trim(),
      password: form.password.value,
      confirm_password: form.confirm_password.value
    };

    if (!validateForm(values)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await res.json();

      if (data.success) {
        showAlert(data.message || 'Registration successful!', 'success');
        form.reset();
        setTimeout(() => { window.location.href = '/login.html'; }, 1500);
      } else {
        showAlert(data.message || 'Registration failed.', 'error');
      }
    } catch (err) {
      console.error('Registration error:', err);
      showAlert('Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
    }
  });

  function validateForm(v) {
    let valid = true;

    for (const key of ['full_name', 'register_number', 'department', 'email', 'phone', 'gender', 'dob', 'year_of_study', 'username', 'password', 'confirm_password']) {
      if (!v[key]) {
        setError(key, 'This field is required.');
        valid = false;
      }
    }

    if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) {
      setError('email', 'Enter a valid email address.');
      valid = false;
    }

    if (v.phone && !/^\d{10}$/.test(v.phone)) {
      setError('phone', 'Phone number must be exactly 10 digits.');
      valid = false;
    }

    if (v.password && v.password.length < 8) {
      setError('password', 'Password must be at least 8 characters.');
      valid = false;
    } else if (v.password && !/[A-Z]/.test(v.password)) {
      setError('password', 'Include at least one uppercase letter.');
      valid = false;
    } else if (v.password && !/[0-9]/.test(v.password)) {
      setError('password', 'Include at least one number.');
      valid = false;
    }

    if (v.password && v.confirm_password && v.password !== v.confirm_password) {
      setError('confirm_password', 'Passwords do not match.');
      valid = false;
    }

    if (usernameError.textContent) valid = false;

    if (!valid) showAlert('Please fix the errors below and try again.', 'error');

    return valid;
  }

  function setError(field, message) {
    const el = document.getElementById(`${field}-error`);
    if (el) el.textContent = message;
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => { if (el.id !== 'username-error') el.textContent = ''; });
  }

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert show alert-${type}`;
  }

  function hideAlert() {
    alertBox.className = 'alert';
  }

  // Password visibility toggles
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Hide' : 'Show';
    });
  });
});
