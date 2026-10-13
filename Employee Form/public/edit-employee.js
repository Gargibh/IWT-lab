/**
 * edit-employee.js
 * Handles edit.html: reads ?id=... from the URL, loads that
 * employee's data (GET), pre-fills the form, and on submit
 * sends the changes back (PUT). Replaces edit_employee.php.
 */

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("editForm");
  const messageBox = document.getElementById("formMessage");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    window.location.href = "employees.html";
    return;
  }

  // ---- Load existing employee data ----
  try {
    const response = await fetch(`/api/employees/${id}`);
    if (!response.ok) {
      window.location.href = "employees.html";
      return;
    }
    const emp = await response.json();
    fillForm(emp);
  } catch (err) {
    showMessage("error", "Could not load employee data.");
    return;
  }

  // ---- Handle save ----
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearAllErrors(form);
    hideMessage();

    if (!validateEmployeeForm(false)) {
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = "employees.html?updated=1";
      } else {
        const errText = (result.errors || [result.error || "Something went wrong."]).join(" ");
        showMessage("error", errText);
      }
    } catch (err) {
      showMessage("error", "Could not reach the server. Please try again.");
    }
  });

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input", function () {
      clearError(field.name);
    });
  });

  function fillForm(emp) {
    document.getElementById("employee_id").value = emp.employee_id;
    document.getElementById("employee_id_display").value = emp.employee_id;
    document.getElementById("employee_name").value = emp.employee_name;
    document.getElementById("email").value = emp.email;
    document.getElementById("phone").value = emp.phone;
    document.getElementById("department").value = emp.department;
    document.getElementById("designation").value = emp.designation;
    document.getElementById("salary").value = emp.salary;
    document.getElementById("address").value = emp.address || "";

    if (emp.date_of_birth) {
      document.getElementById("date_of_birth").value = new Date(emp.date_of_birth)
        .toISOString()
        .split("T")[0];
    }
    if (emp.date_of_joining) {
      document.getElementById("date_of_joining").value = new Date(emp.date_of_joining)
        .toISOString()
        .split("T")[0];
    }

    const genderInput = document.querySelector(
      `input[name="gender"][value="${emp.gender}"]`
    );
    if (genderInput) genderInput.checked = true;
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
