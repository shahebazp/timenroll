

function login() {
    const id = document.getElementById("loginId").value.trim();
    const pwd = document.getElementById("password").value;
    const error = document.getElementById("errorMsg");

    error.innerText = "";

    if (!id || !pwd) {
        error.innerText = "Please enter username and password";
        return;
    }

    if (id === "ZERO" && pwd === "Khan@123") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", "admin");
        window.location.href = "admin-dashboard.html";
    } else {
        error.innerText = "Invalid username or password";
    }
}

// Cursor glow logic
document.addEventListener("DOMContentLoaded", () => {
    const glow = document.getElementById("cursor-glow");
    if (!glow) return;

    document.addEventListener("mousemove", (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
        glow.style.opacity = "1";
    });

    document.addEventListener("mouseleave", () => {
        glow.style.opacity = "0";
    });
});
