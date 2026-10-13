/**
 * register.js
 * Validates the registration form, then POSTs to /auth/register.
 */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const messageBox = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAllErrors();
    hideMessage();

    if (!validate()) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        showMessage("success", "Account created! Redirecting to login...");
        setTimeout(() => (window.location.href = "login.html"), 1200);
      } else {
        showMessage("error", (result.errors || [result.error]).join(" "));
      }
    } catch (err) {
      showMessage("error", "Could not reach the server. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });

  function validate() {
    let isValid = true;

    const fullName = document.getElementById("full_name").value.trim();
    if (fullName === "") { showError("full_name", "Full name is required."); isValid = false; }

    const empId = document.getElementById("employee_id").value.trim();
    if (empId === "") { showError("employee_id", "Employee ID is required."); isValid = false; }

    const email = document.getElementById("email").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("email", "A valid email is required."); isValid = false;
    }

    const phone = document.getElementById("phone").value.trim();
    if (!/^[0-9]{10}$/.test(phone)) {
      showError("phone", "Phone number must be exactly 10 digits."); isValid = false;
    }

    const department = document.getElementById("department").value;
    if (department === "") { showError("department", "Please select a department."); isValid = false; }

    const designation = document.getElementById("designation").value.trim();
    if (designation === "") { showError("designation", "Designation is required."); isValid = false; }

    const password = document.getElementById("password").value;
    if (password.length < 8) {
      showError("password", "Password must be at least 8 characters."); isValid = false;
    }

    const confirmPassword = document.getElementById("confirm_password").value;
    if (password !== confirmPassword) {
      showError("confirm_password", "Passwords do not match."); isValid = false;
    }

    return isValid;
  }

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
