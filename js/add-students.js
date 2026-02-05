let classes = JSON.parse(localStorage.getItem("classes")) || [];
let students = JSON.parse(localStorage.getItem("students")) || {};

function render() {
  const classGrid = document.getElementById("classGrid");
  classGrid.innerHTML = "";

  if (classes.length === 0) {
    classGrid.innerHTML = `
      <div class="class-card">
        <h3>No classes found</h3>
        <p>Please add classes first</p>
        <button class="open-btn" onclick="location.href='add-classes.html'">
          Go to Add Classes
        </button>
      </div>`;
    return;
  }

  classes.forEach(c => {
    const count = students[c]?.length || 0;
    classGrid.innerHTML += `
      <div class="class-card">
        <h3>${c}</h3>
        <div class="count">${count}</div>
        <button class="open-btn" onclick="openClass('${c}')">
          + Add Student
        </button>
      </div>`;
  });
}

function openClass(cls) {
  localStorage.setItem("currentClass", cls);
  location.href = "class-students.html";
}

render();
