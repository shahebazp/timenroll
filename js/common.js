document.addEventListener("DOMContentLoaded", () => {

    /* 1. CHECK LOGIN STATUS
       If not on login page and not logged in, kick user out. */
    if (!window.location.pathname.endsWith("index.html") &&
        localStorage.getItem("loggedIn") !== "true") {
        window.location.href = "index.html";
    }

    /* 2. HIGHLIGHT ACTIVE MENU LINK
       Finds the link that matches current page and makes it white */
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".sidebar nav a");

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

});

/* LOGOUT FUNCTIONALITY */
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("role");
        window.location.href = "index.html";
    }
}