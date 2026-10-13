/* ==========================================================
   DASHBOARD
   Contact List Page Logic
   ========================================================== */

let contacts = [];
let filteredContacts = [];

let activeCategory = "All";

/* ==========================================================
   DOM ELEMENTS
   ========================================================== */

const contactsGrid = UI.$("#contactsGrid");
const searchInput = UI.$("#searchInput");
const addContactForm = UI.$("#addContactForm");
const filterButtons = UI.$$(".filter-pill");

/* ==========================================================
   LOAD CONTACTS FROM API
   ========================================================== */

async function loadContacts() {

    try {

        contacts = await ContactAPI.getAllContacts();

        filteredContacts = [...contacts];

        UI.updateContactCount(contacts.length);

        renderContacts(filteredContacts);

    } catch (error) {

        console.error(error);

        contactsGrid.innerHTML = UI.createEmptyState();

        Toast.error("Couldn't load contacts.");
    }
}

/* ==========================================================
   RENDER CONTACT CARDS
   ========================================================== */

function renderContacts(contactList) {

    contactsGrid.innerHTML = "";

    if (!contactList.length) {

        contactsGrid.innerHTML = UI.createEmptyState();
        return;
    }

    contactList.forEach(contact => {

        contactsGrid.insertAdjacentHTML(
            "beforeend",
            UI.createContactCard(contact)
        );

    });

    attachCardEvents();
}

/* ==========================================================
   CARD CLICK EVENTS
   ========================================================== */

function attachCardEvents() {

    UI.$$(".contact-card").forEach(card => {

        card.addEventListener("click", event => {

            // Prevent menu button opening page.
            if (event.target.closest(".card-menu")) return;

            const id = card.dataset.id;

            UI.goToContact(id);

        });

    });

}

/* ==========================================================
   SEARCH CONTACTS
   ========================================================== */

function applyFilters() {

    const searchTerm = searchInput.value;

    let results = ContactAPI.searchContacts(contacts, searchTerm);

    results = ContactAPI.filterContacts(results, activeCategory);

    filteredContacts = results;

    renderContacts(results);

    UI.updateContactCount(results.length);
}

searchInput?.addEventListener("input", applyFilters);

/* ==========================================================
   CATEGORY FILTERS
   ========================================================== */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        activeCategory = button.textContent.trim();

        applyFilters();

    });

});

/* ==========================================================
   ADD CONTACT FORM
   ========================================================== */

addContactForm?.addEventListener("submit", async event => {

    event.preventDefault();

    const data = UI.getFormData(addContactForm);

    UI.clearValidation(addContactForm);

    const errors = UI.validateContact(data);

    if (Object.keys(errors).length) {

        UI.showValidation(addContactForm, errors);

        Toast.warning("Please fill all required fields.");

        return;
    }

    const submitButton =
        addContactForm.querySelector("button[type='submit']");

    const originalText = submitButton.innerHTML;

    try {

        submitButton.disabled = true;
        submitButton.innerHTML = `<div class="spinner"></div> Saving`;

        const createdContact =
            await ContactAPI.createContact(data);

        contacts.unshift(createdContact);

        applyFilters();

        Modal.close("addContactModal");

        addContactForm.reset();

        Toast.success("Contact added successfully!");

        UI.scrollTop();

    } catch (error) {

        console.error(error);

        Toast.error(error.message || "Couldn't add contact.");

    } finally {

        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }

});

/* ==========================================================
   DELETE CONTACT FROM DASHBOARD (Future Menu Option)
   ========================================================== */

async function removeContact(contactId) {

    try {

        await ContactAPI.deleteContact(contactId);

        contacts = contacts.filter(
            contact => String(contact.id) !== String(contactId)
        );

        applyFilters();

        Toast.success("Contact deleted.");

    } catch (error) {

        console.error(error);

        Toast.error("Couldn't delete contact.");
    }

}

/* ==========================================================
   REFRESH CONTACT LIST
   ========================================================== */

async function refreshContacts() {

    await loadContacts();

    applyFilters();
}

/* ==========================================================
   INITIALIZE PAGE
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadContacts();

});

/* ==========================================================
   GLOBAL ACCESS
   ========================================================== */

window.Dashboard = {
    refreshContacts,
    removeContact,
    renderContacts
};