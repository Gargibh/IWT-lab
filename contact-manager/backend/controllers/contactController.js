import * as ContactModel from "../models/contactModel.js";

/* ======================================
   GET ALL CONTACTS
====================================== */

export async function getContacts(req, res) {

    try {

        const contacts = await ContactModel.getAllContacts();

        res.status(200).json(contacts);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch contacts.",
        });

    }

}

/* ======================================
   GET ONE CONTACT
====================================== */

export async function getContact(req, res) {

    try {

        const contact = await ContactModel.getContactById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found.",
            });
        }

        res.status(200).json(contact);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch contact.",
        });

    }

}

/* ======================================
   CREATE CONTACT
====================================== */

export async function createContact(req, res) {

    try {

        const { name, phone, email } = req.body;

        if (!name || !phone || !email) {

            return res.status(400).json({
                message: "Name, phone and email are required.",
            });

        }

        const contact =
            await ContactModel.createContact(req.body);

        res.status(201).json(contact);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create contact.",
        });

    }

}

/* ======================================
   UPDATE CONTACT
====================================== */

export async function updateContact(req, res) {

    try {

        const existing =
            await ContactModel.getContactById(req.params.id);

        if (!existing) {
            return res.status(404).json({
                message: "Contact not found.",
            });
        }

        const updated =
            await ContactModel.updateContact(
                req.params.id,
                req.body
            );

        res.status(200).json(updated);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update contact.",
        });

    }

}

/* ======================================
   DELETE CONTACT
====================================== */

export async function deleteContact(req, res) {

    try {

        const deleted =
            await ContactModel.deleteContact(req.params.id);

        if (!deleted) {

            return res.status(404).json({
                message: "Contact not found.",
            });

        }

        res.status(200).json({
            message: "Contact deleted successfully.",
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete contact.",
        });

    }

}