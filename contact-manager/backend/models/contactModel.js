import db from "../db.js";

/* ======================================
   GET ALL CONTACTS
====================================== */

export async function getAllContacts() {

    const [rows] = await db.query(`
        SELECT *
        FROM contacts
        ORDER BY created_at DESC
    `);

    return rows;
}

/* ======================================
   GET CONTACT BY ID
====================================== */

export async function getContactById(id) {

    const [rows] = await db.query(
        `SELECT * FROM contacts WHERE id = ?`,
        [id]
    );

    return rows[0];
}

/* ======================================
   CREATE CONTACT
====================================== */

export async function createContact(contact) {

    const { name, phone, email, company, category, notes } = contact;

    const [result] = await db.query(
        `
        INSERT INTO contacts
        (name, phone, email, company, category, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [name, phone, email, company, category, notes]
    );

    return await getContactById(result.insertId);
}

/* ======================================
   UPDATE CONTACT
====================================== */

export async function updateContact(id, contact) {

    const { name, phone, email, company, category, notes } = contact;

    await db.query(
        `
        UPDATE contacts
        SET
            name = ?,
            phone = ?,
            email = ?,
            company = ?,
            category = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [name, phone, email, company, category, notes, id]
    );

    return await getContactById(id);
}

/* ======================================
   DELETE CONTACT
====================================== */

export async function deleteContact(id) {

    const [result] = await db.query(
        `DELETE FROM contacts WHERE id = ?`,
        [id]
    );

    return result.affectedRows;
}