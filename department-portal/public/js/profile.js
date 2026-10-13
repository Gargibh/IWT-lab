// public/js/profile.js
// Loads the logged-in user's profile and handles inline editing.

document.addEventListener('DOMContentLoaded', () => {
  loadProfile();

  const editForm = document.getElementById('edit-profile-form');
  if (editForm) {
    editForm.addEventListener('submit', handleUpdate);
  }

  const toggleEditBtn = document.getElementById('toggle-edit');
  if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
      const panel = document.getElementById('edit-panel');
      panel.classList.toggle('open-panel');
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });
  }

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

async function loadProfile() {
  try {
    const res = await fetch('/profile');

    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }

    const data = await res.json();
    if (!data.success) {
      showAlert(data.message || 'Could not load profile.', 'error');
      return;
    }

    renderProfile(data.user);
  } catch (err) {
    console.error('Profile load error:', err);
    showAlert('Something went wrong loading your profile.', 'error');
  }
}

function renderProfile(user) {
  const el = document.getElementById('profile-details');
  if (!el) return;

  const fields = [
    ['Full Name', user.full_name],
    ['Register Number', user.register_number],
    ['Department', user.department],
    ['Email', user.email],
    ['Phone', user.phone],
    ['Gender', user.gender],
    ['Date of Birth', formatDate(user.dob)],
    ['Year of Study', user.year_of_study],
    ['Username', user.username]
  ];

  el.innerHTML = fields.map(([label, value]) => `
    <div class="profile-field">
      <span class="label">${label}</span>
      <span class="value">${escapeHtml(String(value))}</span>
    </div>
  `).join('');

  // Pre-fill edit form
  const emailInput = document.getElementById('edit-email');
  const phoneInput = document.getElementById('edit-phone');
  if (emailInput) emailInput.value = user.email;
  if (phoneInput) phoneInput.value = user.phone;
}

async function handleUpdate(e) {
  e.preventDefault();
  const form = e.target;
  hideAlert();

  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const new_password = form.new_password.value;
  const confirm_new_password = form.confirm_new_password.value;

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert('Enter a valid email address.', 'error');
    return;
  }
  if (phone && !/^\d{10}$/.test(phone)) {
    showAlert('Phone number must be exactly 10 digits.', 'error');
    return;
  }
  if ((new_password || confirm_new_password) && new_password !== confirm_new_password) {
    showAlert('New passwords do not match.', 'error');
    return;
  }

  const payload = {};
  if (email) payload.email = email;
  if (phone) payload.phone = phone;
  if (new_password) {
    payload.new_password = new_password;
    payload.confirm_new_password = confirm_new_password;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  try {
    const res = await fetch('/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      showAlert(data.message || 'Profile updated.', 'success');
      form.new_password.value = '';
      form.confirm_new_password.value = '';
      loadProfile();
    } else {
      showAlert(data.message || 'Update failed.', 'error');
    }
  } catch (err) {
    console.error('Profile update error:', err);
    showAlert('Something went wrong. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  }
}

function showAlert(message, type) {
  const alertBox = document.getElementById('form-alert');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert show alert-${type}`;
}

function hideAlert() {
  const alertBox = document.getElementById('form-alert');
  if (alertBox) alertBox.className = 'alert';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
