/* ==========================================================
   CONTACT MANAGER API
   Handles all communication with Express + MySQL backend.
   ========================================================== */

const API_BASE_URL = "https://contact-manager-efn9.onrender.com/api/contacts";

/* ==========================================================
   Generic Request Handler
   ========================================================== */

async function apiRequest(endpoint = "", options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });

    let data = {};

    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

/* ==========================================================
   GET ALL CONTACTS
   ========================================================== */

async function getAllContacts() {
    return await apiRequest();
}

/* ==========================================================
   GET SINGLE CONTACT
   ========================================================== */

async function getContactById(contactId) {
    return await apiRequest(`/${contactId}`);
}

/* ==========================================================
   CREATE CONTACT
   ========================================================== */

async function createContact(contactData) {
    return await apiRequest("", {
        method: "POST",
        body: JSON.stringify(contactData),
    });
}

/* ==========================================================
   UPDATE CONTACT
   ========================================================== */

async function updateContact(contactId, contactData) {
    return await apiRequest(`/${contactId}`, {
        method: "PUT",
        body: JSON.stringify(contactData),
    });
}

/* ==========================================================
   DELETE CONTACT
   ========================================================== */

async function deleteContact(contactId) {
    return await apiRequest(`/${contactId}`, {
        method: "DELETE",
    });
}

/* ==========================================================
   SEARCH CONTACTS
   Client-side search helper.
   ========================================================== */

function searchContacts(contacts, searchTerm) {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return contacts;

    return contacts.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        (contact.company || "").toLowerCase().includes(query)
    );
}

/* ==========================================================
   FILTER CONTACTS BY CATEGORY
   ========================================================== */

function filterContacts(contacts, category) {
    if (category === "All") return contacts;

    return contacts.filter(contact => contact.category === category);
}

/* ==========================================================
   EXPORT FOR OTHER FILES
   (Available globally because scripts are loaded normally.)
   ========================================================== */

window.ContactAPI = {
    getAllContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    searchContacts,
    filterContacts,
};