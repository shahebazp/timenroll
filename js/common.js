document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       AUTH PROTECTION (ADMIN PAGES)
    ================================ */
    if (
        !window.location.pathname.endsWith("index.html") &&
        localStorage.getItem("loggedIn") !== "true"
    ) {
        window.location.href = "index.html";
        return;
    }

    /* ===============================
       LOAD SIDEBAR
    ================================ */
    const sidebarContainer = document.getElementById("sidebar-container");

    if (sidebarContainer) {
        fetch("../partials/sidebar.html")
            .then(res => res.text())
            .then(html => {
                sidebarContainer.innerHTML = html;

                // Active link highlight
                document.querySelectorAll(".sidebar nav a").forEach(link => {
                    if (link.href === window.location.href) {
                        link.classList.add("active");
                    }
                });
            });
    }

    /* ===============================
       LOAD LOGOUT MODAL
    ================================ */
    fetch("../partials/logout-modal.html")
        .then(res => res.text())
        .then(html => {
            if (!document.getElementById("logoutModal")) {
                document.body.insertAdjacentHTML("beforeend", html);
            }
        });

});

/* ===============================
   MOBILE SIDEBAR TOGGLE
================================ */
function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("open");
}

/* ===============================
   LOGOUT FLOW
================================ */
function openLogout() {
    document.getElementById("logoutModal").style.display = "flex";
}

function closeLogout() {
    document.getElementById("logoutModal").style.display = "none";
}

function confirmLogout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("role");
    window.location.href = "index.html";
}
