/**
 * login.js
 * Handles the Employee/Admin tab toggle (purely cosmetic - it's
 * just there so the person confirms which portal they meant to
 * enter), then POSTs to /auth/login. The server is the one that
 * actually decides the real role from the database - the tab
 * selection is checked against what the server returns, so
 * picking the wrong tab can't grant access it shouldn't.
 */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const messageBox = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");
  const expectedRoleInput = document.getElementById("expectedRole");
  const tabs = document.querySelectorAll(".role-tab");
  const registerHint = document.getElementById("registerHint");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const role = tab.getAttribute("data-role");
      expectedRoleInput.value = role;
      submitBtn.textContent = role === "admin" ? "Log In as Admin" : "Log In as Employee";
      registerHint.style.display = role === "admin" ? "none" : "block";
    });
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAllErrors();
    hideMessage();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("email", "A valid email is required.");
      return;
    }
    if (password === "") {
      showError("password", "Password is required.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        const expectedRole = expectedRoleInput.value;
        if (result.role !== expectedRole) {
          showMessage(
            "error",
            `This account is registered as ${result.role}, not ${expectedRole}. Switch tabs and try again.`
          );
          submitBtn.disabled = false;
          submitBtn.textContent = expectedRole === "admin" ? "Log In as Admin" : "Log In as Employee";
          return;
        }

        window.location.href = result.role === "admin" ? "admin-dashboard.html" : "employee-dashboard.html";
      } else {
        showMessage("error", result.error || "Login failed.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Log In";
      }
    } catch (err) {
      showMessage("error", "Could not reach the server. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Log In";
    }
  });

  function showError(field, msg) {
    document.getElementById("err-" + field).textContent = msg;
    document.getElementById(field).classList.add("invalid");
  }

  function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  }

  function showMessage(type, text) {
    messageBox.textContent = text;
    messageBox.className = "form-message " + type;
    messageBox.style.display = "block";
  }

  function hideMessage() {
    messageBox.style.display = "none";
  }
});
