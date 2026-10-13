/**
 * index.js
 * If someone's already logged in and lands on the homepage,
 * quietly no-op - we don't force-redirect them, since they
 * might just want to look at the homepage again. Kept minimal
 * on purpose.
 */
document.addEventListener("DOMContentLoaded", function () {
  // Reserved for future homepage behavior (e.g. showing "Go to Dashboard"
  // instead of "Login" if already authenticated).
});
