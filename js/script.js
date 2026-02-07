import { db, collection, getDocs, query, where } from "./firebase-config.js";

// Expose login function to window so HTML can access it if needed
window.login = async function () {
    const idInput = document.getElementById("loginId").value.trim();
    const pwdInput = document.getElementById("password").value.trim();
    const error = document.getElementById("errorMsg");
    const btn = document.querySelector("button"); // Select the login button

    error.innerText = "";

    if (!idInput || !pwdInput) {
        error.innerText = "Please enter username and password";
        return;
    }

    // Show loading state
    const originalText = btn.innerText;
    btn.innerText = "Checking...";
    btn.disabled = true;

    try {
        // --- 1. ADMIN CHECK (Static) ---
        if (idInput === "ZERO" && pwdInput === "Khan@123") {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("role", "admin");
            window.location.href = "html/admin-dashboard.html";
            return;
        }

        // --- 2. FIREBASE CHECK (Teachers) ---
        // Search for a teacher with matching Email AND Password
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
            localStorage.setItem("userName", teacherData.name);
            window.location.href = "html/teacher-dashboard.html";
        } else {
            error.innerText = "Invalid credentials";
            btn.innerText = originalText;
            btn.disabled = false;
        }

    } catch (e) {
        console.error("Login Error:", e);
        error.innerText = "Connection Error. Check internet.";
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

// Event Listeners for "Enter" key
document.addEventListener("DOMContentLoaded", () => {
    // Check if we are on the login page
    const passField = document.getElementById("password");
    if (passField) {
        passField.addEventListener("keypress", (event) => {
            if (event.key === "Enter") window.login();
        });

        // Also attach click listener to button just in case
        const btn = document.querySelector("button");
        if (btn) btn.addEventListener("click", window.login);
    }

    // Cursor glow logic
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