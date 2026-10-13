// public/js/navbar.js
// Shared across all pages: renders navbar links based on session state
// and handles mobile menu toggle.

async function initNavbar() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  let loggedIn = false;
  try {
    const res = await fetch('/session-status');
    const data = await res.json();
    loggedIn = data.loggedIn;
  } catch (err) {
    console.error('Could not check session status:', err);
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const guestLinks = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About Us' },
    { href: 'register.html', label: 'Register' },
    { href: 'login.html', label: 'Login' }
  ];

  const userLinks = [
    { href: 'index.html', label: 'Home' },
    { href: 'about.html', label: 'About Us' },
    { href: 'dashboard.html', label: 'Dashboard' },
    { href: 'profile.html', label: 'Profile' },
    { href: '#', label: 'Logout', id: 'logout-link' }
  ];

  const links = loggedIn ? userLinks : guestLinks;

  navLinks.innerHTML = links.map(link => {
    const active = link.href === currentPage ? 'class="active"' : '';
    const id = link.id ? `id="${link.id}"` : '';
    return `<li><a href="${link.href}" ${active} ${id}>${link.label}</a></li>`;
  }).join('');

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      window.location.href = '/logout';
    });
  }
}

function initMenuToggle() {
  const toggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!toggle || !navLinks) return;
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMenuToggle();
});
