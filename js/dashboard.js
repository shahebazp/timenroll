const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
const students = JSON.parse(localStorage.getItem("students")) || {};
const classes = JSON.parse(localStorage.getItem("classes")) || [];

document.getElementById("teacherCount").innerText = teachers.length;

document.getElementById("studentCount").innerText =
    Object.values(students).reduce((sum, arr) => sum + arr.length, 0);

document.getElementById("classCount").innerText = classes.length;
