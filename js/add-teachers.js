let teachers = JSON.parse(localStorage.getItem("teachers")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || [];
let editIndex = null;

/* ===========================
   VALIDATION HELPERS
=========================== */
function onlyLetters(input) {
    input.value = input.value.replace(/[^a-zA-Z]/g, "");
}
function onlyNumbers(input) {
    input.value = input.value.replace(/[^0-9]/g, "");
}

/* ===========================
   UI TOGGLES
=========================== */
function toggleForm() {
    const form = document.getElementById("formBox");
    const importBox = document.getElementById("importBox");

    form.style.display = (form.style.display === "none") ? "block" : "none";
    importBox.style.display = "none";

    if (form.style.display === "block") {
        clearForm();
        editIndex = null;
        loadClasses();
    }
}

function toggleImport() {
    const form = document.getElementById("formBox");
    const importBox = document.getElementById("importBox");

    importBox.style.display = (importBox.style.display === "none") ? "block" : "none";
    form.style.display = "none";
}

/* ===========================
   MANUAL SAVE
=========================== */
function saveTeacher() {
    const id = document.getElementById("tid").value.trim();
    const f = document.getElementById("fname").value.trim();
    const m = document.getElementById("mname").value.trim();
    const l = document.getElementById("lname").value.trim();
    const em = document.getElementById("email").value.trim();
    const mob = document.getElementById("mobile").value.trim();

    // 1. Compulsory Fields
    if (!id || !f || !m || !l || !em) {
        alert("Teacher ID, Full Name (First, Middle, Last), and Email are REQUIRED.");
        return;
    }

    // 2. Mobile Validation (Optional but strict if entered)
    if (mob && mob.length !== 10) {
        alert("Mobile number must be 10 digits.");
        return;
    }

    // 3. Name Formatting
    const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    const fullName = `${cap(f)} ${cap(m)} ${cap(l)}`;

    // 4. Get Assigned Classes
    const assigned = [...document.querySelectorAll(".classCheck:checked")].map(c => c.value);

    // 5. Create Object
    // If editing, keep old password, else generate random one
    let pwd = (editIndex !== null) ? teachers[editIndex].password : Math.random().toString(36).slice(-8);

    const newTeacher = {
        id: id,
        name: fullName,
        email: em,
        mobile: mob || "-",
        classes: assigned,
        password: pwd
    };

    if (editIndex === null) {
        // Check Duplicate ID or Email
        if (teachers.some(t => t.id === id || t.email === em)) {
            alert("Duplicate Teacher ID or Email found!");
            return;
        }
        teachers.push(newTeacher);
    } else {
        // Allow update only if ID/Email isn't taken by someone else
        const conflict = teachers.some((t, i) => (t.id === id || t.email === em) && i !== editIndex);
        if (conflict) {
            alert("ID or Email is already taken by another teacher.");
            return;
        }
        teachers[editIndex] = newTeacher;
        editIndex = null;
    }

    localStorage.setItem("teachers", JSON.stringify(teachers));
    toggleForm();
    renderTeachers();
}

/* ===========================
   EXCEL IMPORT LOGIC
=========================== */
function downloadTemplate() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + "Teacher ID,First Name,Middle Name,Last Name,Email,Mobile,Password\n"
        + "T-101,Alice,Marie,Smith,alice@school.com,9876543210,pass123";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "teacher_template.csv");
    document.body.appendChild(link);
    link.click();
}

function processImport() {
    const fileInput = document.getElementById("excelFile");
    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        json.shift(); // Remove header

        let addedCount = 0;
        let skippedCount = 0;

        json.forEach(row => {
            const id = row[0];
            const f = row[1];
            const m = row[2];
            const l = row[3];
            const em = row[4];
            const mob = row[5];
            const pass = row[6]; // Optional password from excel

            if (id && f && m && l && em) {
                // Check duplicate
                if (!teachers.some(t => t.id == id || t.email == em)) {
                    teachers.push({
                        id: id.toString(),
                        name: `${f} ${m} ${l}`,
                        email: em,
                        mobile: mob || "-",
                        classes: [], // Classes must be assigned manually later
                        password: pass || "123456" // Default if empty
                    });
                    addedCount++;
                } else {
                    skippedCount++;
                }
            }
        });

        localStorage.setItem("teachers", JSON.stringify(teachers));
        alert(`Import Complete!\nAdded: ${addedCount}\nSkipped: ${skippedCount}`);
        renderTeachers();
        toggleImport();
        fileInput.value = "";
    };

    reader.readAsArrayBuffer(file);
}

/* ===========================
   RENDER & UTILS
=========================== */
function renderTeachers() {
    const list = document.getElementById("teacherList");
    list.innerHTML = "";

    if (teachers.length === 0) {
        list.innerHTML = "<p style='color:#888; text-align:center;'>No teachers added yet.</p>";
        return;
    }

    teachers.forEach((t, i) => {
        list.innerHTML += `
        <div class="list-item">
            <div>
                <b style="font-size:16px;">${t.name}</b> <span style="font-size:12px; color:#666;">(${t.id})</span>
                <div style="font-size:13px; color:#888; margin-top:4px;">
                    Classes: <span style="color:#00b4d8; font-weight:600;">${t.classes.length ? t.classes.join(", ") : "None"}</span>
                </div>
                <div style="font-size:12px; color:#aaa; margin-top:2px;">Pass: ${t.password}</div>
            </div>
            <div>
                <button class="action-btn btn-edit" onclick="openEdit(${i})">Edit</button>
                <button class="action-btn btn-del" onclick="deleteTeacher(${i})">Delete</button>
            </div>
        </div>`;
    });
}

function openEdit(i) {
    editIndex = i;
    const t = teachers[i];
    toggleForm(); // Open form

    document.getElementById("tid").value = t.id;
    document.getElementById("email").value = t.email;
    document.getElementById("mobile").value = (t.mobile === "-") ? "" : t.mobile;

    // Split Name
    let parts = t.name.split(" ");
    document.getElementById("fname").value = parts[0] || "";
    document.getElementById("mname").value = parts[1] || "";
    document.getElementById("lname").value = parts.slice(2).join(" ") || "";

    // Check checkboxes
    document.querySelectorAll(".classCheck").forEach(box => {
        box.checked = t.classes.includes(box.value);
    });
}

function deleteTeacher(i) {
    if (confirm("Delete this teacher account?")) {
        teachers.splice(i, 1);
        localStorage.setItem("teachers", JSON.stringify(teachers));
        renderTeachers();
    }
}

function loadClasses() {
    const container = document.getElementById("classList");
    container.innerHTML = classes.length
        ? classes.map(c => `
        <label style="display:flex; align-items:center; background:#f9f9f9; padding:8px; border-radius:8px; font-size:13px; cursor:pointer;">
          <input type="checkbox" class="classCheck" value="${c}" style="width:auto; margin-right:8px;">
          ${c}
        </label>`).join("")
        : "<p style='color:red; font-size:13px;'>No classes created yet.</p>";
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
renderTeachers();