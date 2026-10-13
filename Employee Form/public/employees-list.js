/**
 * employees-list.js
 * Fetches all employees from the API and renders them into
 * an HTML table (replaces the old employees.php, which did
 * this same job server-side with PHP + a SQL SELECT).
 */

document.addEventListener("DOMContentLoaded", loadEmployees);

async function loadEmployees() {
  const container = document.getElementById("tableContainer");

  try {
    const response = await fetch("/api/employees");
    const employees = await response.json();

    if (!response.ok) {
      container.innerHTML = `<p class="no-records">Failed to load employees.</p>`;
      return;
    }

    if (employees.length === 0) {
      container.innerHTML = `<p class="no-records">No employee records found. Click "Add New Employee" to create one.</p>`;
      return;
    }

    renderTable(employees, container);
  } catch (err) {
    container.innerHTML = `<p class="no-records">Could not reach the server.</p>`;
  }
}

function renderTable(employees, container) {
  const rows = employees
    .map(
      (emp) => `
    <tr data-id="${emp.employee_id}">
      <td>${escapeHtml(emp.employee_id)}</td>
      <td>${escapeHtml(emp.employee_name)}</td>
      <td>${escapeHtml(emp.email)}</td>
      <td>${escapeHtml(emp.phone)}</td>
      <td>${escapeHtml(emp.gender)}</td>
      <td>${escapeHtml(emp.department)}</td>
      <td>${escapeHtml(emp.designation)}</td>
      <td>${Number(emp.salary).toFixed(2)}</td>
      <td>${formatDate(emp.date_of_birth)}</td>
      <td>${formatDate(emp.date_of_joining)}</td>
      <td>${escapeHtml(emp.address || "")}</td>
      <td class="action-links">
        <a class="edit-link" href="edit.html?id=${encodeURIComponent(emp.employee_id)}">Edit</a>
        <a class="delete-link" data-id="${emp.employee_id}">Delete</a>
      </td>
    </tr>`
    )
    .join("");

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th>
          <th>Department</th><th>Designation</th><th>Salary</th>
          <th>Date of Birth</th><th>Date of Joining</th><th>Address</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  container.querySelectorAll(".delete-link").forEach((link) => {
    link.addEventListener("click", handleDelete);
  });
}

async function handleDelete(event) {
  const id = event.target.getAttribute("data-id");
  const messageBox = document.getElementById("listMessage");

  if (!confirm(`Delete employee #${id}? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    const result = await response.json();

    if (response.ok) {
      showListMessage("success", "Employee deleted successfully.");
      loadEmployees();
    } else {
      showListMessage("error", result.error || "Failed to delete employee.");
    }
  } catch (err) {
    showListMessage("error", "Could not reach the server.");
  }
}

function showListMessage(type, text) {
  const messageBox = document.getElementById("listMessage");
  messageBox.textContent = text;
  messageBox.className = "form-message " + type;
  messageBox.style.display = "block";
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return escapeHtml(String(value));
  return d.toISOString().split("T")[0];
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
