let teachers = JSON.parse(localStorage.getItem("teachers")) || [];
let classes = JSON.parse(localStorage.getItem("classes")) || [];
let editIndex = null;


function lettersOnly(input) {
    input.value = input.value.replace(/[^a-zA-Z ]/g, "");
}

function openAdd() {
    editIndex = null;
    clearForm();
    document.getElementById("formBox").style.display = "block";
}

function openEdit(i) {
    editIndex = i;
    const t = teachers[i];

    tid.value = t.id;
    fname.value = t.name.split(" ")[0] || "";
    mname.value = t.name.split(" ")[1] || "";
    lname.value = t.name.split(" ")[2] || "";
    email.value = t.email;
    mobile.value = t.mobile;

    document.querySelectorAll(".classCheck").forEach(c => {
        c.checked = t.classes.includes(c.value);
    });

    formBox.style.display = "block";
}

function randomPassword() {
    return Math.random().toString(36).slice(-8);
}

function saveTeacher() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[0-9]{10}$/;

    if (!tid.value || !fname.value || !lname.value || !email.value || !mobile.value) {
        alert("All fields required");
        return;
    }

    if (!emailRegex.test(email.value)) {
        alert("Invalid email");
        return;
    }

    if (!mobileRegex.test(mobile.value)) {
        alert("Mobile must be 10 digits");
        return;
    }

    const assigned = [...document.querySelectorAll(".classCheck:checked")].map(c => c.value);

    if (editIndex === null) {
        if (teachers.some(t => t.id === tid.value || t.email === email.value || t.mobile === mobile.value)) {
            alert("Duplicate ID / Email / Mobile");
            return;
        }

        teachers.push({
            id: tid.value,
            name: fname.value + " " + mname.value + " " + lname.value,
            email: email.value,
            mobile: mobile.value,
            classes: assigned,
            password: randomPassword()
        });
    } else {
        teachers[editIndex] = {
            ...teachers[editIndex],
            id: tid.value,
            name: fname.value + " " + mname.value + " " + lname.value,
            email: email.value,
            mobile: mobile.value,
            classes: assigned
        };
    }

    localStorage.setItem("teachers", JSON.stringify(teachers));
    clearForm();
    formBox.style.display = "none";
    renderTeachers();
}

function clearForm() {
    tid.value = fname.value = mname.value = lname.value = email.value = mobile.value = "";
    document.querySelectorAll(".classCheck").forEach(c => c.checked = false);
}

function deleteTeacher(i) {
    if (confirm("Delete teacher?")) {
        teachers.splice(i, 1);
        localStorage.setItem("teachers", JSON.stringify(teachers));
        renderTeachers();
    }
}

function renderTeachers() {
    teacherList.innerHTML = "";
    teachers.forEach((t, i) => {
        teacherList.innerHTML += `
      <div class="teacher-card">
        <div class="teacher-header">
          <b>${t.id} – ${t.name}</b>
          <div class="teacher-actions">
            <button class="edit-btn" onclick="openEdit(${i})">Edit</button>
            <button class="delete-btn" onclick="deleteTeacher(${i})">Delete</button>
          </div>
        </div>
        <div class="teacher-details">
          Email: ${t.email}<br>
          Mobile: ${t.mobile}<br>
          Classes: ${t.classes.join(", ")}<br>
          <b>Password:</b> ${t.password}
        </div>
      </div>`;
    });
}

function loadClasses() {
    classList.innerHTML = classes.length
        ? classes.map(c => `
        <label>
          <input type="checkbox" class="classCheck" value="${c}">
          ${c}
        </label><br>
      `).join("")
        : "No classes added yet";
}

loadClasses();
renderTeachers();
