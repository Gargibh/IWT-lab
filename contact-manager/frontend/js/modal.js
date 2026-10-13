/* ==========================================================
   MODAL CONTROLLER
   Shared Add / Edit / Delete modal behaviour.
   ========================================================== */

const Modal = (() => {

    let activeModal = null;

    /* ======================================================
       HELPERS
    ====================================================== */

    function lockBody() {
        document.body.style.overflow = "hidden";
    }

    function unlockBody() {
        document.body.style.overflow = "";
    }

    /* ======================================================
       OPEN MODAL
    ====================================================== */

    function open(modalId) {

        const modal = document.getElementById(modalId);

        if (!modal) return;

        // Close any existing modal first
        if (activeModal && activeModal !== modal) {
            close(activeModal.id);
        }

        activeModal = modal;

        modal.classList.remove("hidden");

        lockBody();

        const modalWindow =
            modal.querySelector(".toy-modal") ||
            modal.querySelector(".delete-modal");

        if (modalWindow) {
            modalWindow.style.animation = "none";

            requestAnimationFrame(() => {
                modalWindow.style.animation = "modalPop .35s ease";
            });
        }
    }

    /* ======================================================
       CLOSE MODAL
    ====================================================== */

    function close(modalId) {

        const modal = document.getElementById(modalId);

        if (!modal) return;

        const modalWindow =
            modal.querySelector(".toy-modal") ||
            modal.querySelector(".delete-modal");

        if (modalWindow) {

            modalWindow.style.animation = "modalClose .2s ease forwards";

            setTimeout(() => {
                modal.classList.add("hidden");
                modalWindow.style.animation = "";
            }, 180);

        } else {

            modal.classList.add("hidden");
        }

        activeModal = null;

        unlockBody();
    }

    /* ======================================================
       CLOSE ACTIVE MODAL
    ====================================================== */

    function closeCurrent() {

        if (activeModal) {
            close(activeModal.id);
        }
    }

    /* ======================================================
       CLICK OUTSIDE TO CLOSE
    ====================================================== */

    function enableOverlayClose() {

        document.querySelectorAll(".modal-overlay").forEach(overlay => {

            overlay.addEventListener("click", event => {

                if (event.target === overlay) {
                    close(overlay.id);
                }

            });

        });

    }

    /* ======================================================
       ESC KEY CLOSE
    ====================================================== */

    function enableEscapeKey() {

        document.addEventListener("keydown", event => {

            if (event.key === "Escape" && activeModal) {
                closeCurrent();
            }

        });

    }

    /* ======================================================
       BUTTON BINDINGS
    ====================================================== */

    function bindButtons() {

        /* ---------- Dashboard ---------- */

        UI.$("#openAddModal")?.addEventListener("click", () => {
            open("addContactModal");
        });

        UI.$("#floatingAddButton")?.addEventListener("click", () => {
            open("addContactModal");
        });

        UI.$("#closeAddModal")?.addEventListener("click", () => {
            close("addContactModal");
        });

        /* ---------- Contact Page ---------- */

        UI.$("#openEditModal")?.addEventListener("click", () => {
            open("editModal");
        });

        UI.$("#closeEditModal")?.addEventListener("click", () => {
            close("editModal");
        });

        UI.$("#openDeleteModal")?.addEventListener("click", () => {
            open("deleteModal");
        });

        UI.$("#cancelDelete")?.addEventListener("click", () => {
            close("deleteModal");
        });

    }

    /* ======================================================
       RESET FORMS WHEN MODALS CLOSE
    ====================================================== */

    function resetForms() {

        document.querySelectorAll(".modal-overlay").forEach(modal => {

            modal.addEventListener("transitionend", () => {

                if (!modal.classList.contains("hidden")) return;

                const form = modal.querySelector("form");

                if (!form) return;

                // Only reset Add Contact form
                if (form.id === "addContactForm") {
                    form.reset();
                    UI.clearValidation(form);
                }

            });

        });

    }

    /* ======================================================
       INITIALIZE
    ====================================================== */

    function init() {

        bindButtons();
        enableOverlayClose();
        enableEscapeKey();
        resetForms();

    }

    return {
        init,
        open,
        close,
        closeCurrent
    };

})();

/* ==========================================================
   AUTO INITIALIZE
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    Modal.init();
});

/* ==========================================================
   GLOBAL ACCESS
   ========================================================== */

window.Modal = Modal;