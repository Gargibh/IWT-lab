/**
 * employee.js
 * Runs on employee-dashboard.html. Confirms the visitor is
 * actually logged in (redirects to login.html otherwise - this
 * is a frontend convenience check; the REAL enforcement is
 * requireAuth on the server, which the fetch calls below still
 * go through), loads their profile, and handles saving it.
 */

let profileExists = false;

document.addEventListener("DOMContentLoaded", async function () {
  const form = document.getElementById("profileForm");
  const messageBox = document.getElementById("pageMessage");
  const saveBtn = document.getElementById("saveBtn");

  // ---- Confirm session + greet ----
  try {
    const meRes = await fetch("/auth/me");
    if (!meRes.ok) {
      window.location.href = "login.html";
      return;
    }
    const me = await meRes.json();
    if (me.role !== "employee") {
      window.location.href = "login.html";
      return;
    }
    document.getElementById("userGreeting").textContent = me.fullName;
    document.getElementById("welcomeName").textContent = "Welcome, " + me.fullName;
  } catch (err) {
    window.location.href = "login.html";
    return;
  }

  // ---- Load existing profile ----
  try {
    const res = await fetch("/employee/profile");
    if (res.ok) {
      const profile = await res.json();
      fillForm(profile);
      profileExists = !!profile.dob || !!profile.address || !!profile.gender;
      // (a simple heuristic: if any profile-specific field has data, treat it as "existing")
    }
  } catch (err) {
    showMessage("error", "Could not load your profile.");
  }

  // ---- Save / update ----
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    hideMessage();

    const phone = document.getElementById("phone").value.trim();
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      document.getElementById("err-phone").textContent = "Phone number must be 10 digits.";
      return;
    }
    document.getElementById("err-phone").textContent = "";

    const data = {
      gender: document.getElementById("gender").value,
      dob: document.getElementById("dob").value,
      address: document.getElementById("address").value.trim(),
      city: document.getElementById("city").value.trim(),
      state: document.getElementById("state").value.trim(),
      joining_date: document.getElementById("joining_date").value,
      skills: document.getElementById("skills").value.trim(),
      emergency_contact: document.getElementById("emergency_contact").value.trim(),
    };

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const method = profileExists ? "PUT" : "POST";
      const res = await fetch("/employee/profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        showMessage("success", result.message);
        profileExists = true;
      } else {
        showMessage("error", result.error || "Failed to save.");
      }
    } catch (err) {
      showMessage("error", "Could not reach the server.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Details";
    }
  });

  // ---- Logout ----
  document.getElementById("logoutBtn").addEventListener("click", async function () {
    await fetch("/auth/logout");
    window.location.href = "login.html";
  });

  function fillForm(p) {
    document.getElementById("full_name").value = p.full_name || "";
    document.getElementById("employee_id").value = p.employee_id || "";
    document.getElementById("email").value = p.email || "";
    document.getElementById("department").value = p.department || "";
    document.getElementById("designation").value = p.designation || "";
    document.getElementById("phone").value = p.phone || "";
    document.getElementById("gender").value = p.gender || "";
    document.getElementById("city").value = p.city || "";
    document.getElementById("state").value = p.state || "";
    document.getElementById("address").value = p.address || "";
    document.getElementById("skills").value = p.skills || "";
    document.getElementById("emergency_contact").value = p.emergency_contact || "";
    if (p.dob) document.getElementById("dob").value = new Date(p.dob).toISOString().split("T")[0];
    if (p.joining_date) {
      document.getElementById("joining_date").value = new Date(p.joining_date).toISOString().split("T")[0];
    }
  }

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
