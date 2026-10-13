// public/js/home.js
// Loads latest news dynamically on the homepage.

async function loadNews() {
  const container = document.getElementById('news-container');
  if (!container) return;

  container.innerHTML = '<p>Loading latest news...</p>';

  try {
    const res = await fetch('/news');
    const data = await res.json();

    if (!data.success || data.news.length === 0) {
      container.innerHTML = '<p>No news available right now.</p>';
      return;
    }

    container.innerHTML = data.news.slice(0, 4).map(item => `
      <div class="card news-card">
        <span class="date">${formatDate(item.published_date)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load news:', err);
    container.innerHTML = '<p>Could not load news at this time.</p>';
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

document.addEventListener('DOMContentLoaded', loadNews);
