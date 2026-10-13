/**
 * validation.js
 * Shared client-side validation, used by both index.html (add)
 * and edit.html (edit). This mirrors the checks server.js also
 * performs - client-side is for instant feedback, server-side
 * is the real gatekeeper (never trust the browser alone).
 */

function calculateAge(dob, today) {
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function showError(fieldName, message) {
  const errorEl = document.getElementById("err-" + fieldName);
  const fieldEl = document.getElementById(fieldName);
  if (errorEl) errorEl.textContent = message;
  if (fieldEl) fieldEl.classList.add("invalid");
}

function clearError(fieldName) {
  const errorEl = document.getElementById("err-" + fieldName);
  const fieldEl = document.getElementById(fieldName);
  if (errorEl) errorEl.textContent = "";
  if (fieldEl) fieldEl.classList.remove("invalid");
}

function clearAllErrors(form) {
  form.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""));
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
}

/**
 * Validates the form fields. Pass requireEmployeeId = false on the
 * edit page, since the ID field there is disabled/read-only.
 * Returns true if everything is valid, false otherwise.
 */
function validateEmployeeForm(requireEmployeeId = true) {
  let isValid = true;

  if (requireEmployeeId) {
    const employeeId = document.getElementById("employee_id");
    if (!employeeId.value || parseInt(employeeId.value, 10) <= 0) {
      showError("employee_id", "Please enter a valid Employee ID.");
      isValid = false;
    }
  }

  const name = document.getElementById("employee_name");
  const nameValue = name.value.trim();
  if (nameValue === "") {
    showError("employee_name", "Employee name is required.");
    isValid = false;
  } else if (!/^[A-Za-z\s.'-]{2,100}$/.test(nameValue)) {
    showError("employee_name", "Name should contain letters only (2-100 characters).");
    isValid = false;
  }

  const email = document.getElementById("email");
  const emailValue = email.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailValue === "") {
    showError("email", "Email is required.");
    isValid = false;
  } else if (!emailPattern.test(emailValue)) {
    showError("email", "Please enter a valid email address.");
    isValid = false;
  }

  const phone = document.getElementById("phone");
  const phoneValue = phone.value.trim();
  if (phoneValue === "") {
    showError("phone", "Phone number is required.");
    isValid = false;
  } else if (!/^[0-9]{10}$/.test(phoneValue)) {
    showError("phone", "Phone number must be exactly 10 digits.");
    isValid = false;
  }

  const genderChecked = document.querySelector('input[name="gender"]:checked');
  if (!genderChecked) {
    showError("gender", "Please select a gender.");
    isValid = false;
  }

  const dob = document.getElementById("date_of_birth");
  if (dob.value) {
    const dobDate = new Date(dob.value);
    const today = new Date();
    const age = calculateAge(dobDate, today);
    if (dobDate >= today) {
      showError("date_of_birth", "Date of birth must be in the past.");
      isValid = false;
    } else if (age < 18) {
      showError("date_of_birth", "Employee must be at least 18 years old.");
      isValid = false;
    }
  }

  const department = document.getElementById("department");
  if (department.value === "") {
    showError("department", "Please select a department.");
    isValid = false;
  }

  const designation = document.getElementById("designation");
  if (designation.value.trim() === "") {
    showError("designation", "Designation is required.");
    isValid = false;
  }

  const salary = document.getElementById("salary");
  if (!salary.value || parseFloat(salary.value) <= 0) {
    showError("salary", "Please enter a valid salary greater than 0.");
    isValid = false;
  }

  const doj = document.getElementById("date_of_joining");
  if (!doj.value) {
    showError("date_of_joining", "Date of joining is required.");
    isValid = false;
  } else if (dob.value) {
    const dojDate = new Date(doj.value);
    const dobDate = new Date(dob.value);
    if (dojDate <= dobDate) {
      showError("date_of_joining", "Date of joining must be after date of birth.");
      isValid = false;
    }
  }

  return isValid;
}
