function login() {
    const idInput = document.getElementById("loginId").value.trim();
    const pwdInput = document.getElementById("password").value.trim();
    const error = document.getElementById("errorMsg");

    error.innerText = "";

    if (!idInput || !pwdInput) {
        error.innerText = "Please enter username and password";
        return;
    }

    // 1. CHECK ADMIN LOGIN
    if (idInput === "ZERO" && pwdInput === "Khan@123") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", "admin");
        window.location.href = "html/admin-dashboard.html"; // Note: path assumes we are at root
        return;
    }

    // 2. CHECK TEACHER LOGIN
    // We search the 'teachers' list for a matching Email & Password
    const teachers = JSON.parse(localStorage.getItem("teachers")) || [];

    const foundTeacher = teachers.find(t => t.email === idInput && t.password === pwdInput);

    if (foundTeacher) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", "teacher");
        localStorage.setItem("userEmail", foundTeacher.email); // Save who is logged in
        window.location.href = "html/teacher-dashboard.html";
    } else {
        error.innerText = "Invalid credentials";
    }
}

// Cursor glow logic (Keep this for the cool effect)
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