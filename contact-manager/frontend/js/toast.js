/* ==========================================================
   TOAST NOTIFICATION SYSTEM
   Retro Contact Manager
   ========================================================== */

const Toast = (() => {

    let toastElement = null;
    let toastTimer = null;

    /* ======================================================
       CREATE TOAST ELEMENT IF IT DOESN'T EXIST
    ====================================================== */

    function createToast() {

        toastElement = document.getElementById("toastMessage");

        if (toastElement) return toastElement;

        toastElement = document.createElement("div");

        toastElement.id = "toastMessage";
        toastElement.className = "toast hidden";

        document.body.appendChild(toastElement);

        return toastElement;
    }

    /* ======================================================
       SHOW TOAST
    ====================================================== */

    function show(message, type = "success", duration = 2500) {

        const toast = createToast();

        clearTimeout(toastTimer);

        toast.classList.remove("hidden", "hide", "show");

        // Reset state classes
        toast.classList.remove("success", "error", "warning", "info");

        // Set icon + color based on type
        let icon = "✔";

        switch (type) {

            case "error":
                icon = "✖";
                toast.classList.add("error");
                break;

            case "warning":
                icon = "⚠";
                toast.classList.add("warning");
                break;

            case "info":
                icon = "ℹ";
                toast.classList.add("info");
                break;

            default:
                toast.classList.add("success");
        }

        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;

        // Trigger entrance animation
        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        toastTimer = setTimeout(() => {
            hide();
        }, duration);
    }

    /* ======================================================
       HIDE TOAST
    ====================================================== */

    function hide() {

        if (!toastElement) return;

        toastElement.classList.remove("show");
        toastElement.classList.add("hide");

        setTimeout(() => {
            toastElement.classList.add("hidden");
            toastElement.classList.remove("hide");
        }, 300);
    }

    /* ======================================================
       QUICK HELPERS
    ====================================================== */

    function success(message) {
        show(message, "success");
    }

    function error(message) {
        show(message, "error", 3200);
    }

    function warning(message) {
        show(message, "warning", 3000);
    }

    function info(message) {
        show(message, "info");
    }

    return {
        show,
        hide,
        success,
        error,
        warning,
        info,
    };

})();

/* ==========================================================
   GLOBAL ACCESS
   ========================================================== */

window.Toast = Toast;