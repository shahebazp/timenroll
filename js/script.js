// 1. Import the Database from our Config File
import { db, collection, getDocs, query, where } from "./firebase-config.js";

// 2. Define the Login Function
async function login() {
    const idInput = document.getElementById("loginId").value.trim();
    const pwdInput = document.getElementById("password").value.trim();
    const error = document.getElementById("errorMsg");
    const btn = document.getElementById("loginBtn");

    error.innerText = "";

    if (!idInput || !pwdInput) {
        error.innerText = "Please enter username and password";
        return;
    }

    // Show Loading State
    btn.innerText = "Checking...";
    btn.disabled = true;

    try {
        // --- CHECK 1: ADMIN LOGIN (Static) ---
        // You can change this password later if you want
        if (idInput === "ZERO" && pwdInput === "Khan@123") {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("role", "admin");
            window.location.href = "html/admin-dashboard.html";
            return;
        }

        // --- CHECK 2: TEACHER LOGIN (From Firebase Database) ---
        // We look for a teacher with this Email AND Password
        const q = query(
            collection(db, "teachers"),
            where("email", "==", idInput),
            where("password", "==", pwdInput)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Teacher Found!
            const teacherData = querySnapshot.docs[0].data();
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("role", "teacher");
            localStorage.setItem("userEmail", teacherData.email);
            localStorage.setItem("userName", teacherData.name); // Save name for dashboard
            window.location.href = "html/teacher-dashboard.html";
        } else {
            error.innerText = "Invalid credentials";
            btn.innerText = "Login";
            btn.disabled = false;
        }

    } catch (e) {
        console.error("Login Error:", e);
        error.innerText = "Connection Error. Please check internet.";
        btn.innerText = "Login";
        btn.disabled = false;
    }
}

// 3. Attach Event Listeners (Since we removed onclick from HTML)
document.addEventListener("DOMContentLoaded", () => {

    // Button Click
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", login);
    }

    // Enter Key in Password Field
    const passField = document.getElementById("password");
    if (passField) {
        passField.addEventListener("keypress", (event) => {
            if (event.key === "Enter") login();
        });
    }

    // Cursor Glow Effect
    const glow = document.getElementById("cursor-glow");
    if (glow) {
        document.addEventListener("mousemove", (e) => {
            glow.style.left = e.clientX + "px";
            glow.style.top = e.clientY + "px";
            glow.style.opacity = "1";
        });
        document.addEventListener("mouseleave", () => {
            glow.style.opacity = "0";
        });
    }
});