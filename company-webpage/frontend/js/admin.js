/**
 * admin.js
 * Runs on admin-dashboard.html. Confirms an admin session,
 * loads stats + the employee table, and wires up search,
 * view/edit (via modal), and delete.
 */

document.addEventListener("DOMContentLoaded", async function () {
  const tableContainer = document.getElementById("tableContainer");
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("modalOverlay");
  const editForm = document.getElementById("editForm");

  // ---- Confirm session is actually an admin ----
  try {
    const meRes = await fetch("/auth/me");
    if (!meRes.ok) {
      window.location.href = "login.html";
      return;
    }
    const me = await meRes.json();
    if (me.role !== "admin") {
      window.location.href = "login.html";
      return;
    }
    document.getElementById("userGreeting").textContent = me.fullName;
  } catch (err) {
    window.location.href = "login.html";
    return;
  }

  loadStats();
  loadEmployees();

  document.getElementById("searchBtn").addEventListener("click", () => loadEmployees(searchInput.value.trim()));
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") loadEmployees(searchInput.value.trim());
  });

  document.getElementById("logoutBtn").addEventListener("click", async function () {
    await fetch("/auth/logout");
    window.location.href = "login.html";
  });

  document.getElementById("closeModalBtn").addEventListener("click", closeModal);

  editForm.addEventListener("submit", handleSaveEdit);

  // ---- Stats ----
  async function loadStats() {
    try {
      const res = await fetch("/admin/stats");
      if (!res.ok) return;
      const stats = await res.json();
      document.getElementById("statTotal").textContent = stats.total;
      document.getElementById("statDepartments").textContent = stats.departments;
      document.getElementById("statRecent").textContent = stats.recent;
    } catch (err) {
      /* stats are non-critical, fail silently */
    }
  }

  // ---- Table ----
  async function loadEmployees(search = "") {
    tableContainer.innerHTML = `<p class="no-records">Loading employees...</p>`;
    try {
      const url = search ? `/admin/employees?search=${encodeURIComponent(search)}` : "/admin/employees";
      const res = await fetch(url);
      const employees = await res.json();

      if (!res.ok) {
        tableContainer.innerHTML = `<p class="no-records">Failed to load employees.</p>`;
        return;
      }
      if (employees.length === 0) {
        tableContainer.innerHTML = `<p class="no-records">No employees found.</p>`;
        return;
      }
      renderTable(employees);
    } catch (err) {
      tableContainer.innerHTML = `<p class="no-records">Could not reach the server.</p>`;
    }
  }

  function renderTable(employees) {
    const rows = employees
      .map(
        (e) => `
      <tr>
        <td>${escapeHtml(e.employee_id)}</td>
        <td>${escapeHtml(e.full_name)}</td>
        <td>${escapeHtml(e.email)}</td>
        <td>${escapeHtml(e.department || "")}</td>
        <td>${escapeHtml(e.designation || "")}</td>
        <td>${escapeHtml(e.phone || "")}</td>
        <td>${formatDate(e.joining_date)}</td>
        <td class="action-links">
          <a class="view-link" data-id="${e.id}" data-action="view">View</a>
          <a class="edit-link" data-id="${e.id}" data-action="edit">Edit</a>
          <button class="delete-link" data-id="${e.id}" data-action="delete">Delete</button>
        </td>
      </tr>`
      )
      .join("");

    tableContainer.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Department</th>
            <th>Designation</th><th>Phone</th><th>Joining Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;

    tableContainer.querySelectorAll("[data-action]").forEach((el) => {
      const id = el.getAttribute("data-id");
      const action = el.getAttribute("data-action");
      if (action === "view" || action === "edit") {
        el.addEventListener("click", () => openModal(id));
      } else if (action === "delete") {
        el.addEventListener("click", () => handleDelete(id));
      }
    });
  }

  // ---- View/Edit modal ----
  async function openModal(id) {
    try {
      const res = await fetch(`/admin/employees/${id}`);
      if (!res.ok) return;
      const emp = await res.json();

      document.getElementById("edit_id").value = emp.id;
      document.getElementById("edit_full_name").value = emp.full_name || "";
      document.getElementById("edit_employee_id").value = emp.employee_id || "";
      document.getElementById("edit_email").value = emp.email || "";
      document.getElementById("edit_phone").value = emp.phone || "";
      document.getElementById("edit_department").value = emp.department || "";
      document.getElementById("edit_designation").value = emp.designation || "";
      document.getElementById("edit_gender").value = emp.gender || "";
      document.getElementById("edit_city").value = emp.city || "";
      document.getElementById("edit_state").value = emp.state || "";
      document.getElementById("edit_address").value = emp.address || "";
      document.getElementById("edit_skills").value = emp.skills || "";
      document.getElementById("edit_emergency_contact").value = emp.emergency_contact || "";
      document.getElementById("edit_dob").value = emp.dob ? new Date(emp.dob).toISOString().split("T")[0] : "";
      document.getElementById("edit_joining_date").value = emp.joining_date
        ? new Date(emp.joining_date).toISOString().split("T")[0]
        : "";

      document.getElementById("modalMessage").style.display = "none";
      modalOverlay.classList.add("open");
    } catch (err) {
      showPageMessage("error", "Could not load employee details.");
    }
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    const id = document.getElementById("edit_id").value;
    const formData = new FormData(editForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/admin/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        closeModal();
        showPageMessage("success", "Employee updated successfully.");
        loadEmployees(searchInput.value.trim());
      } else {
        showModalMessage("error", result.error || "Failed to update employee.");
      }
    } catch (err) {
      showModalMessage("error", "Could not reach the server.");
    }
  }

  // ---- Delete ----
  async function handleDelete(id) {
    if (!confirm("Delete this employee? This cannot be undone.")) return;

    try {
      const res = await fetch(`/admin/employees/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (res.ok) {
        showPageMessage("success", "Employee deleted successfully.");
        loadEmployees(searchInput.value.trim());
        loadStats();
      } else {
        showPageMessage("error", result.error || "Failed to delete employee.");
      }
    } catch (err) {
      showPageMessage("error", "Could not reach the server.");
    }
  }

  function showPageMessage(type, text) {
    const box = document.getElementById("pageMessage");
    box.textContent = text;
    box.className = "form-message " + type;
    box.style.display = "block";
  }

  function showModalMessage(type, text) {
    const box = document.getElementById("modalMessage");
    box.textContent = text;
    box.className = "form-message " + type;
    box.style.display = "block";
  }

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
