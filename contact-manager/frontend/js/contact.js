/* ==========================================================
   CONTACT DETAILS PAGE
   View, Edit and Delete a Contact
   ========================================================== */

let currentContact = null;

/* ==========================================================
   DOM ELEMENTS
   ========================================================== */

const profileAvatar = document.querySelector(".profile-avatar");
const profileName = document.querySelector(".profile-info h2");
const categoryTag = document.querySelector(".category-tag");
const companyPill = document.querySelector(".company-pill");

const infoItems = document.querySelectorAll(".info-item");
const notesParagraph = document.querySelector(".notes-box p");

const editForm = document.querySelector("#editContactForm");
const confirmDeleteButton = document.querySelector("#confirmDelete");

/* ==========================================================
   LOAD CONTACT
   ========================================================== */

async function loadContact() {

    const contactId = UI.getContactIdFromURL();

    if (!contactId) {
        Toast.error("Contact not found.");
        setTimeout(UI.goHome, 1500);
        return;
    }

    try {

        currentContact = await ContactAPI.getContactById(contactId);

        populatePage(currentContact);
        UI.populateForm(editForm, currentContact);

    } catch (error) {

        console.error("LOAD CONTACT ERROR:", error);

        Toast.error("Unable to load contact.");

        setTimeout(UI.goHome, 1500);

    }

}

/* ==========================================================
   POPULATE CONTACT PAGE
   ========================================================== */

function populatePage(contact) {

    document.title = `${contact.name} • Contact Manager`;

    profileAvatar.textContent = UI.getInitials(contact.name);

    profileName.textContent = contact.name;

    categoryTag.textContent = contact.category;
    categoryTag.className = `category-tag ${UI.getCategoryClass(contact.category)}`;

    companyPill.textContent = contact.company || "No Company";

    infoItems[0].textContent = `📞 ${UI.formatPhone(contact.phone)}`;
    infoItems[1].textContent = `✉ ${contact.email}`;
    infoItems[2].textContent = `🏢 ${contact.company || "No Company"}`;

    notesParagraph.textContent =
        contact.notes || "No notes added yet.";
}

/* ==========================================================
   EDIT CONTACT
   ========================================================== */

editForm?.addEventListener("submit", async (event) => {

    event.preventDefault();

    const updatedData = UI.getFormData(editForm);

    UI.clearValidation(editForm);

    const errors = UI.validateContact(updatedData);

    if (Object.keys(errors).length) {

        UI.showValidation(editForm, errors);
        Toast.warning("Please fix the highlighted fields.");

        return;
    }

    const saveButton =
        editForm.querySelector("button[type='submit']");

    const originalText = saveButton.innerHTML;

    try {

        saveButton.disabled = true;
        saveButton.innerHTML = `<div class="spinner"></div> Saving`;

        const updatedContact = await ContactAPI.updateContact(
            currentContact.id,
            updatedData
        );

        currentContact = updatedContact;

        populatePage(updatedContact);

        Modal.close("editModal");

        Toast.success("Contact updated!");

    } catch (error) {

        console.error(error);

        Toast.error(error.message || "Couldn't update contact.");

    } finally {

        saveButton.disabled = false;
        saveButton.innerHTML = originalText;

    }

});

/* ==========================================================
   DELETE CONTACT
   ========================================================== */

confirmDeleteButton?.addEventListener("click", async () => {

    if (!currentContact) return;

    const deleteModal =
        document.querySelector(".delete-modal");

    deleteModal.classList.add("shake");

    setTimeout(() => {
        deleteModal.classList.remove("shake");
    }, 350);

    try {

        await ContactAPI.deleteContact(currentContact.id);

        Modal.close("deleteModal");

        Toast.success("Contact deleted!");

        setTimeout(() => {
            UI.goHome();
        }, 1200);

    } catch (error) {

        console.error(error);

        Toast.error("Unable to delete contact.");
    }

});

/* ==========================================================
   HOME BUTTON
   ========================================================== */

document.querySelector(".home-button")?.addEventListener("click", (event) => {

    event.preventDefault();
    UI.goHome();

});

/* ==========================================================
   INITIALIZE PAGE
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadContact();

});

/* ==========================================================
   GLOBAL ACCESS
   ========================================================== */

window.ContactPage = {
    reload: loadContact
};