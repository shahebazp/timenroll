import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "./firebase-config.js";

// We still use local storage for classes (since classes are simple)
let classes = JSON.parse(localStorage.getItem("classes")) || [];
let editId = null;

/* ===========================
   UI FUNCTIONS
=========================== */
window.toggleForm = function () {
    const form = document.getElementById("formBox");
    const importBox = document.getElementById("importBox");

    form.style.display = (form.style.display === "none") ? "block" : "none";
    importBox.style.display = "none";

    if (form.style.display === "block") {
        clearForm();
        editId = null;
        loadClasses();
    }
}

window.toggleImport = function () {
    const form = document.getElementById("formBox");
    const importBox = document.getElementById("importBox");
    importBox.style.display = (importBox.style.display === "none") ? "block" : "none";
    form.style.display = "none";
}

/* ===========================
   SAVE TO FIREBASE
=========================== */
window.saveTeacher = async function () {
    const btn = document.querySelector("button[onclick='saveTeacher()']");
    const originalText = btn.innerText;
    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        const id = document.getElementById("tid").value.trim();
        const f = document.getElementById("fname").value.trim();
        const m = document.getElementById("mname").value.trim();
        const l = document.getElementById("lname").value.trim();
        const em = document.getElementById("email").value.trim();
        const mob = document.getElementById("mobile").value.trim();

        if (!id || !f || !m || !l || !em) {
            alert("Teacher ID, Full Name, and Email are REQUIRED.");
            throw new Error("Validation Failed");
        }

        const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        const fullName = `${cap(f)} ${cap(m)} ${cap(l)}`;

        // Get Assigned Classes
        const assigned = [...document.querySelectorAll(".classCheck:checked")].map(c => c.value);

        const teacherData = {
            teacherId: id,
            name: fullName,
            email: em,
            mobile: mob || "-",
            classes: assigned,
            password: Math.random().toString(36).slice(-8) // Random Password
        };

        if (editId) {
            // Update existing
            const ref = doc(db, "teachers", editId);
            delete teacherData.password; // Don't change password on edit
            await updateDoc(ref, teacherData);
            alert("Teacher Updated!");
        } else {
            // Create New - Check duplicates
            const q = query(collection(db, "teachers"), where("email", "==", em));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                alert("Email already exists!");
                throw new Error("Duplicate");
            }

            await addDoc(collection(db, "teachers"), teacherData);
            alert("Teacher Saved to Cloud!");
        }

        toggleForm();
        renderTeachers();

    } catch (e) {
        console.error(e);
        if (e.message !== "Validation Failed" && e.message !== "Duplicate") {
            alert("Error: " + e.message);
        }
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

/* ===========================
   LOAD FROM FIREBASE
=========================== */
async function renderTeachers() {
    const list = document.getElementById("teacherList");
    list.innerHTML = "<p style='text-align:center; padding:20px;'>Loading data...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        list.innerHTML = "";

        if (querySnapshot.empty) {
            list.innerHTML = "<p style='color:#888; text-align:center;'>No teachers found in database.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const t = doc.data();
            const docId = doc.id; // Firestore ID

            list.innerHTML += `
            <div class="list-item">
                <div>
                    <b style="font-size:16px;">${t.name}</b> <span style="font-size:12px; color:#666;">(${t.teacherId})</span>
                    <div style="font-size:13px; color:#888; margin-top:4px;">
                        Classes: <span style="color:#00b4d8; font-weight:600;">${t.classes ? t.classes.join(", ") : "None"}</span>
                    </div>
                    <div style="font-size:12px; color:#aaa; margin-top:2px;">Pass: ${t.password || "****"}</div>
                </div>
                <div>
                    <button class="action-btn btn-del" onclick="deleteTeacher('${docId}')">Delete</button>
                </div>
            </div>`;
        });

    } catch (e) {
        list.innerHTML = "<p style='color:red; text-align:center;'>Error loading data.</p>";
        console.error(e);
    }
}

window.deleteTeacher = async function (docId) {
    if (confirm("Delete this teacher permanently?")) {
        try {
            await deleteDoc(doc(db, "teachers", docId));
            renderTeachers();
        } catch (e) {
            alert("Error deleting: " + e.message);
        }
    }
}

// Helpers
window.onlyLetters = function (input) { input.value = input.value.replace(/[^a-zA-Z]/g, ""); }
window.onlyNumbers = function (input) { input.value = input.value.replace(/[^0-9]/g, ""); }

function loadClasses() {
    const container = document.getElementById("classList");
    container.innerHTML = classes.length
        ? classes.map(c => `
        <label style="display:flex; align-items:center; background:#f9f9f9; padding:8px; border-radius:8px; font-size:13px; cursor:pointer;">
          <input type="checkbox" class="classCheck" value="${c}" style="width:auto; margin-right:8px;">
          ${c}
        </label>`).join("")
        : "<p style='color:red; font-size:13px;'>No classes created locally yet.</p>";
}

function clearForm() {
    document.getElementById("tid").value = "";
    document.getElementById("fname").value = "";
    document.getElementById("mname").value = "";
    document.getElementById("lname").value = "";
    document.getElementById("email").value = "";
    document.getElementById("mobile").value = "";
    document.querySelectorAll(".classCheck").forEach(c => c.checked = false);
}

// Initial Load
document.addEventListener("DOMContentLoaded", renderTeachers);