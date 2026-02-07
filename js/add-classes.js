import { db, collection, addDoc, getDocs, deleteDoc, doc, query, where } from "./firebase-config.js";

// Make functions global so HTML buttons can see them
window.addClass = async function () {
    const input = document.getElementById("classInput");
    const className = input.value.trim().toUpperCase(); // Force uppercase for consistency
    const btn = document.querySelector("button[onclick='addClass()']");

    if (!className) {
        alert("Please enter a class name (e.g., BCA FY)");
        return;
    }

    btn.innerText = "Saving...";
    btn.disabled = true;

    try {
        // 1. Check for Duplicate
        const q = query(collection(db, "classes"), where("name", "==", className));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            alert("Class already exists!");
            return; // Stop here
        }

        // 2. Save to Firebase
        await addDoc(collection(db, "classes"), { name: className });

        input.value = ""; // Clear input
        loadClasses(); // Refresh list

    } catch (e) {
        console.error("Error adding class: ", e);
        alert("Error saving class. Check console.");
    } finally {
        btn.innerText = "+ Add Class";
        btn.disabled = false;
    }
}

window.deleteClass = async function (docId, className) {
    if (confirm(`Delete ${className}? This might affect students assigned to it.`)) {
        try {
            await deleteDoc(doc(db, "classes", docId));
            loadClasses();
        } catch (e) {
            console.error("Error deleting class: ", e);
            alert("Could not delete class.");
        }
    }
}

async function loadClasses() {
    const list = document.getElementById("classList");
    list.innerHTML = "<p style='text-align:center; color:#888;'>Loading classes...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "classes"));
        list.innerHTML = "";

        if (querySnapshot.empty) {
            list.innerHTML = "<p style='text-align:center; color:#aaa;'>No classes added yet.</p>";
            return;
        }

        // Sort classes alphabetically
        const classes = [];
        querySnapshot.forEach((doc) => {
            classes.push({ id: doc.id, ...doc.data() });
        });

        classes.sort((a, b) => a.name.localeCompare(b.name));

        classes.forEach((c) => {
            list.innerHTML += `
            <div class="class-card">
                <span>${c.name}</span>
                <button class="btn-del" onclick="deleteClass('${c.id}', '${c.name}')">×</button>
            </div>`;
        });

        // Also update LocalStorage so other pages (like students) can still read it 
        // temporarily until we fix them too.
        const simpleList = classes.map(c => c.name);
        localStorage.setItem("classes", JSON.stringify(simpleList));

    } catch (e) {
        console.error("Error loading classes: ", e);
        list.innerHTML = "<p style='color:red; text-align:center;'>Error loading data.</p>";
    }
}

// Initial Load
document.addEventListener("DOMContentLoaded", loadClasses);