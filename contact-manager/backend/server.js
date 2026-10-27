/* ==========================================================
   CONTACT MANAGER SERVER
   Express + MySQL Backend
   ========================================================== */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import contactRoutes from "./routes/contacts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ==========================================================
   MIDDLEWARE
   ========================================================== */

// Allow frontend requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL encoded forms
app.use(express.urlencoded({ extended: true }));

/* ==========================================================
   HEALTH CHECK
   ========================================================== */

app.get("/", (req, res) => {
    res.json({
        message: "📒 Contact Manager API is running!",
        status: "success"
    });
});

/* ==========================================================
   API ROUTES
   ========================================================== */

app.use("/api/contacts", contactRoutes);

/* ==========================================================
   404 HANDLER
   ========================================================== */

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

/* ==========================================================
   GLOBAL ERROR HANDLER
   ========================================================== */

app.use((err, req, res, next) => {

    console.error("Server Error:", err);

    res.status(500).json({
        message: "Internal server error."
    });

});

/* ==========================================================
   START SERVER
   ========================================================== */

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at ${PORT}`);
});