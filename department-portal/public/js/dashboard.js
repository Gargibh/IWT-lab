// public/js/dashboard.js
// Fetches and renders the logged-in student's dashboard.

document.addEventListener('DOMContentLoaded', loadDashboard);

async function loadDashboard() {
  try {
    const res = await fetch('/dashboard');

    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }

    const data = await res.json();
    if (!data.success) {
      showError(data.message || 'Could not load dashboard.');
      return;
    }

    renderGreeting(data.student);
    renderProfileSummary(data.student);
    renderAnnouncements(data.announcements);
    renderEvents(data.upcomingEvents);
    renderAttendance(data.attendance);
    renderMarks(data.internalMarks);
  } catch (err) {
    console.error('Dashboard load error:', err);
    showError('Something went wrong loading your dashboard.');
  }
}

function renderGreeting(student) {
  const el = document.getElementById('greeting');
  if (el) el.textContent = `Welcome back, ${student.full_name.split(' ')[0]}!`;
  const sub = document.getElementById('greeting-sub');
  if (sub) sub.textContent = `${student.department} · ${student.year_of_study}`;
}

function renderProfileSummary(student) {
  const el = document.getElementById('profile-summary');
  if (!el) return;
  el.innerHTML = `
    <div class="profile-field"><span class="label">Register Number</span><span class="value">${escapeHtml(student.register_number)}</span></div>
    <div class="profile-field"><span class="label">Username</span><span class="value">${escapeHtml(student.username)}</span></div>
    <div class="profile-field"><span class="label">Email</span><span class="value">${escapeHtml(student.email)}</span></div>
    <div class="profile-field"><span class="label">Phone</span><span class="value">${escapeHtml(student.phone)}</span></div>
  `;
}

function renderAnnouncements(list) {
  const el = document.getElementById('announcements');
  if (!el) return;
  if (!list || list.length === 0) {
    el.innerHTML = '<p>No announcements right now.</p>';
    return;
  }
  el.innerHTML = list.map(item => `
    <div class="card news-card">
      <span class="date">${formatDate(item.published_date)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </div>
  `).join('');
}

function renderEvents(events) {
  const el = document.getElementById('upcoming-events');
  if (!el) return;
  el.innerHTML = events.map(ev => `
    <li><strong>${escapeHtml(ev.title)}</strong> — ${formatDate(ev.date)}</li>
  `).join('');
}

function renderAttendance(attendance) {
  const el = document.getElementById('attendance-value');
  if (el) el.textContent = `${attendance.percentage}%`;
  const status = document.getElementById('attendance-status');
  if (status) status.textContent = attendance.status;
}

function renderMarks(marks) {
  const el = document.getElementById('marks-value');
  if (el) el.textContent = marks.score;
  const label = document.getElementById('marks-label');
  if (label) label.textContent = marks.subject;
}

function showError(message) {
  const el = document.getElementById('dashboard-error');
  if (el) {
    el.textContent = message;
    el.className = 'alert show alert-error';
  }
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
