/**
 * add-employee.js
 * Handles the "Add Employee" form on index.html.
 * Validates on the client, then sends a POST request to the
 * Express API (replaces the old insert_employee.php).
 */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("employeeForm");
  const messageBox = document.getElementById("formMessage");
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAllErrors(form);
    hideMessage();

    if (!validateEmployeeForm(true)) {
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("success", "Employee added successfully!");
        form.reset();
      } else {
        const errText = (result.errors || [result.error || "Something went wrong."]).join(" ");
        showMessage("error", errText);
      }
    } catch (err) {
      showMessage("error", "Could not reach the server. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      clearError(field.name);
    });
  });

  function showMessage(type, text) {
    messageBox.textContent = text;
    messageBox.className = "form-message " + type;
    messageBox.style.display = "block";
    messageBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideMessage() {
    messageBox.style.display = "none";
  }
});
