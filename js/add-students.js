let classes = JSON.parse(localStorage.getItem("classes")) || [];
let students = JSON.parse(localStorage.getItem("students")) || {};

function render() {
  const classGrid = document.getElementById("classGrid");
  classGrid.innerHTML = "";

  if (classes.length === 0) {
    classGrid.innerHTML = `
      <div class="glass-panel" style="grid-column: 1 / -1; text-align: center;">
        <h3>No classes found</h3>
        <p style="margin-bottom:15px; color:#666;">Please create a class first.</p>
        <button class="btn-primary" onclick="location.href='add-classes.html'">
          Go to Add Classes
        </button>
      </div>`;
    return;
  }

  classes.forEach(c => {
    const count = students[c]?.length || 0;
    // Using the new 'stat-card' style for class blocks
    classGrid.innerHTML += `
      <div class="stat-card">
        <h2 style="font-size: 32px;">${c}</h2>
        <p>${count} Students</p>
        <button class="btn-primary" style="margin-top:15px; width:100%;" onclick="openClass('${c}')">
          Manage Students
        </button>
      </div>`;
  });
}

function openClass(cls) {
  localStorage.setItem("currentClass", cls);
  location.href = "class-students.html";
}

render();