import express from "express";

import {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

/* ======================================
   ROUTES
====================================== */

// GET all contacts
router.get("/", getContacts);

// GET one contact
router.get("/:id", getContact);

// CREATE
router.post("/", createContact);

// UPDATE
router.put("/:id", updateContact);

// DELETE
router.delete("/:id", deleteContact);

export default router;