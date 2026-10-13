/* ==========================================================
   UI HELPERS
   Shared functions used across the Contact Manager.
   ========================================================== */

const UI = {

    /* ======================================================
       DOM HELPERS
    ====================================================== */

    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /* ======================================================
       CONTACT COUNT
    ====================================================== */

    updateContactCount(count) {

        const counter = document.querySelector(".contact-counter");

        if (!counter) return;

        counter.textContent = `${count} Contact${count === 1 ? "" : "s"}`;
    },

    /* ======================================================
       AVATAR INITIALS
    ====================================================== */

    getInitials(name = "") {

        return name
            .trim()
            .split(" ")
            .slice(0, 2)
            .map(word => word.charAt(0).toUpperCase())
            .join("");
    },

    /* ======================================================
       CATEGORY CLASS
    ====================================================== */

    getCategoryClass(category = "") {

        const classes = {
            Friend: "friend-tag",
            Family: "family-tag",
            Work: "work-tag",
            Other: "other-tag",
        };

        return classes[category] || "other-tag";
    },

    /* ======================================================
       ESCAPE HTML
    ====================================================== */

    escapeHTML(text = "") {

        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },

    /* ======================================================
       FORMAT PHONE
       Simple formatting for Indian numbers.
    ====================================================== */

    formatPhone(phone = "") {

        const digits = phone.replace(/\D/g, "");

        if (digits.length === 10) {
            return `+91 ${digits.slice(0,5)} ${digits.slice(5)}`;
        }

        return phone;
    },

    /* ======================================================
       CREATE CONTACT CARD HTML
    ====================================================== */

    createContactCard(contact) {

        return `
            <article class="contact-card" data-id="${contact.id}">

                <button class="card-menu" data-id="${contact.id}">
                    ⋮
                </button>

                <div class="avatar-circle">
                    ${UI.getInitials(contact.name)}
                </div>

                <h2>${UI.escapeHTML(contact.name)}</h2>

                <p class="phone">
                    📞 ${UI.formatPhone(contact.phone)}
                </p>

                <p class="email">
                    ✉ ${UI.escapeHTML(contact.email)}
                </p>

                <p class="company">
                    🏢 ${UI.escapeHTML(contact.company || "—")}
                </p>

                <span class="category-tag ${UI.getCategoryClass(contact.category)}">
                    ${UI.escapeHTML(contact.category)}
                </span>

            </article>
        `;
    },

    /* ======================================================
       EMPTY STATE
    ====================================================== */

    createEmptyState() {

        return `
            <div class="empty-card">

                <div class="empty-icon">
                    ☎
                </div>

                <h2>No Contacts Yet</h2>

                <p>
                    Add your first contact using the chunky + button.
                </p>

            </div>
        `;
    },

    /* ======================================================
       URL PARAMETER
    ====================================================== */

    getContactIdFromURL() {

        const params = new URLSearchParams(window.location.search);
        return params.get("id");
    },

    /* ======================================================
       PAGE NAVIGATION
    ====================================================== */

    goToContact(contactId) {

        window.location.href = `contact.html?id=${contactId}`;
    },

    goHome() {

        window.location.href = "index.html";
    },

    /* ======================================================
       SCROLL TO TOP
    ====================================================== */

    scrollTop() {

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    },

    /* ======================================================
       FORM DATA
    ====================================================== */

    getFormData(form) {

        const formData = new FormData(form);

        return {
            name: formData.get("name")?.trim(),
            phone: formData.get("phone")?.trim(),
            email: formData.get("email")?.trim(),
            company: formData.get("company")?.trim(),
            category: formData.get("category"),
            notes: formData.get("notes")?.trim(),
        };
    },

    /* ======================================================
       FILL FORM
    ====================================================== */

    populateForm(form, contact) {

        form.name.value = contact.name || "";
        form.phone.value = contact.phone || "";
        form.email.value = contact.email || "";
        form.company.value = contact.company || "";
        form.category.value = contact.category || "Friend";
        form.notes.value = contact.notes || "";
    },

    /* ======================================================
       SIMPLE VALIDATION
    ====================================================== */

    validateContact(data) {

        const errors = {};

        if (!data.name) {
            errors.name = "Name is required.";
        }

        if (!data.phone) {
            errors.phone = "Phone number is required.";
        }

        if (!data.email) {
            errors.email = "Email is required.";
        } else {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(data.email)) {
                errors.email = "Enter a valid email address.";
            }
        }

        return errors;
    },

    /* ======================================================
       CLEAR VALIDATION
    ====================================================== */

    clearValidation(form) {

        form.querySelectorAll(".error").forEach(input => {
            input.classList.remove("error");
        });

        form.querySelectorAll(".input-error").forEach(error => {
            error.remove();
        });
    },

    /* ======================================================
       SHOW VALIDATION ERRORS
    ====================================================== */

    showValidation(form, errors) {

        Object.entries(errors).forEach(([field, message]) => {

            const input = form[field];

            if (!input) return;

            input.classList.add("error");

            const error = document.createElement("small");
            error.className = "input-error";
            error.textContent = message;

            input.insertAdjacentElement("afterend", error);
        });
    },

    /* ======================================================
       CLICK ANIMATION
    ====================================================== */

    animateButton(button) {

        button.classList.remove("button-pop");

        void button.offsetWidth;

        button.classList.add("button-pop");
    }

};

/* ==========================================================
   GLOBAL ACCESS
   ========================================================== */

window.UI = UI;