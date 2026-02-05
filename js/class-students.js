let cls = localStorage.getItem("currentClass");
let students = JSON.parse(localStorage.getItem("students")) || {};
students[cls] = students[cls] || [];
let editIndex = null;

document.getElementById("title").innerText = "Students – " + cls;


function lettersOnly(input) {
    input.value = input.value.replace(/[^a-zA-Z ]/g, "");
}

function saveStudent() {
    if (!roll.value || !fname.value || !lname.value) {
        alert("Roll number & name required");
        return;
    }

    if (editIndex === null) {
        if (students[cls].some(s => s.roll === roll.value)) {
            alert("Duplicate roll number");
            return;
        }

        students[cls].push({
            roll: roll.value,
            name: fname.value + " " + mname.value + " " + lname.value,
            email: email.value,
            mobile: mobile.value
        });
    } else {
        students[cls][editIndex] = {
            roll: roll.value,
            name: fname.value + " " + mname.value + " " + lname.value,
            email: email.value,
            mobile: mobile.value
        };
        editIndex = null;
    }

    localStorage.setItem("students", JSON.stringify(students));
    clearForm();
    render();
}

function editStudent(i) {
    editIndex = i;
    let s = students[cls][i];

    roll.value = s.roll;
    fname.value = s.name.split(" ")[0] || "";
    mname.value = s.name.split(" ")[1] || "";
    lname.value = s.name.split(" ")[2] || "";
    email.value = s.email;
    mobile.value = s.mobile;
}

function deleteStudent(i) {
    if (confirm("Delete student?")) {
        students[cls].splice(i, 1);
        localStorage.setItem("students", JSON.stringify(students));
        render();
    }
}

function clearForm() {
    roll.value = fname.value = mname.value = lname.value = email.value = mobile.value = "";
}

function render() {
    list.innerHTML = "";
    students[cls].forEach((s, i) => {
        list.innerHTML += `
      <div class="student-card">
        <b>${s.roll} – ${s.name}</b><br>
        Email: ${s.email || "-"} | Mobile: ${s.mobile || "-"}<br><br>
        <div class="actions">
          <button onclick="editStudent(${i})">Edit</button>
          <button onclick="deleteStudent(${i})">Delete</button>
        </div>
      </div>`;
    });
}

render();
