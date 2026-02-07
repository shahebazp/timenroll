/* ===========================
   INIT & STATS
=========================== */
const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
const students = JSON.parse(localStorage.getItem("students")) || {};
const classes = JSON.parse(localStorage.getItem("classes")) || [];
// Teacher Attendance Data (Date -> {TeacherID: Status})
const teacherAtt = JSON.parse(localStorage.getItem("teacherAttendance")) || {};

// Update Stats
document.getElementById("teacherCount").innerText = teachers.length;
document.getElementById("studentCount").innerText = Object.values(students).reduce((sum, arr) => sum + arr.length, 0);
document.getElementById("classCount").innerText = classes.length;

/* ===========================
   MODAL HELPERS
=========================== */
function openTeacherAttendance() {
    document.getElementById("teacherModal").classList.add("active");
    document.getElementById("attDate").valueAsDate = new Date(); // Default to today
    loadTeacherList();
}

function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}

/* ===========================
   TEACHER ATTENDANCE LOGIC
=========================== */
function loadTeacherList() {
    const date = document.getElementById("attDate").value;
    const list = document.getElementById("teacherListContainer");
    list.innerHTML = "";

    if (!date) return;

    const todayData = teacherAtt[date] || {};

    if (teachers.length === 0) {
        list.innerHTML = "<p>No teachers found.</p>";
        return;
    }

    teachers.forEach(t => {
        // Default to "Present" if not marked yet
        const status = todayData[t.id] || "Present";

        // Set Color based on status
        let color = "green";
        if (status === "Absent") color = "red";
        if (status === "On Duty") color = "orange";

        list.innerHTML += `
        <div class="attendance-row">
            <div>
                <strong>${t.name}</strong>
                <div style="font-size:12px; color:#888;">${t.id}</div>
            </div>
            <select class="status-select" id="status_${t.id}" onchange="this.style.color = this.value === 'Present' ? 'green' : (this.value === 'Absent' ? 'red' : 'orange')" style="color:${color}">
                <option value="Present" ${status === "Present" ? "selected" : ""}>Present</option>
                <option value="Absent" ${status === "Absent" ? "selected" : ""}>Absent</option>
                <option value="On Duty" ${status === "On Duty" ? "selected" : ""}>On Duty</option>
            </select>
        </div>`;
    });
}

function saveTeacherAttendance() {
    const date = document.getElementById("attDate").value;
    if (!date) { alert("Select date first"); return; }

    const attendanceRecord = {};

    teachers.forEach(t => {
        const val = document.getElementById(`status_${t.id}`).value;
        attendanceRecord[t.id] = val;
    });

    teacherAtt[date] = attendanceRecord;
    localStorage.setItem("teacherAttendance", JSON.stringify(teacherAtt));

    alert("Teacher Attendance Saved for " + date);
    closeModal('teacherModal');
}

/* ===========================
   REPORT DOWNLOAD LOGIC
=========================== */
function openReports() {
    document.getElementById("reportModal").classList.add("active");
    loadClassDropdowns();
    switchReport('student'); // Default view
}

function loadClassDropdowns() {
    const options = classes.map(c => `<option value="${c}">${c}</option>`).join("");
    document.getElementById("reportClass").innerHTML = options;
    document.getElementById("reportTeacherClass").innerHTML = `<option value="">All Teachers</option>` + options;
}

function switchReport(type) {
    const sForm = document.getElementById("studentReportForm");
    const tForm = document.getElementById("teacherReportForm");
    const sBtn = document.getElementById("btnStudent");
    const tBtn = document.getElementById("btnTeacher");

    if (type === 'student') {
        sForm.style.display = "block";
        tForm.style.display = "none";
        sBtn.style.background = "#00c9a7"; sBtn.style.color = "white";
        tBtn.style.background = "#f1f2f6"; tBtn.style.color = "#333";
    } else {
        sForm.style.display = "none";
        tForm.style.display = "block";
        sBtn.style.background = "#f1f2f6"; sBtn.style.color = "#333";
        tBtn.style.background = "#0984e3"; tBtn.style.color = "white";
    }
}

/* --- 1. DOWNLOAD STUDENT REPORT --- */
function downloadStudentReport() {
    const cls = document.getElementById("reportClass").value;
    const month = document.getElementById("reportMonthStudent").value;

    if (!cls || !month) { alert("Please select Class and Month"); return; }

    // Mock Data for Students (Since marking is on teacher's side)
    const reportData = [["Date", "Roll No", "Student Name", "Class", "Status"]];
    const daysInMonth = new Date(month.split("-")[0], month.split("-")[1], 0).getDate();
    const classStudents = students[cls] || [];

    if (classStudents.length === 0) { alert("No students in this class"); return; }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${month}-${String(d).padStart(2, '0')}`;
        classStudents.forEach(s => {
            const status = Math.random() > 0.1 ? "Present" : "Absent"; // Mock
            reportData.push([dateStr, s.roll, s.name, cls, status]);
        });
    }

    const ws = XLSX.utils.aoa_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Student_Report_${cls}_${month}.xlsx`);
    closeModal('reportModal');
}

/* --- 2. DOWNLOAD TEACHER REPORT --- */
function downloadTeacherReport() {
    const filterClass = document.getElementById("reportTeacherClass").value;
    const month = document.getElementById("reportMonthTeacher").value;

    if (!month) { alert("Please select a Month"); return; }

    // Filter Teachers
    let targetTeachers = teachers;
    if (filterClass) {
        targetTeachers = teachers.filter(t => t.classes.includes(filterClass));
    }

    if (targetTeachers.length === 0) { alert("No teachers found."); return; }

    // Create Headers
    const [year, mStr] = month.split("-");
    const daysInMonth = new Date(year, mStr, 0).getDate();

    const headerRow = ["ID", "Name", "Assigned Classes"];
    for (let d = 1; d <= daysInMonth; d++) headerRow.push(d);
    headerRow.push("Total Present", "Total Absent", "On Duty");

    const reportData = [headerRow];

    targetTeachers.forEach(t => {
        let present = 0, absent = 0, duty = 0;
        const row = [t.id, t.name, t.classes.join(", ")];

        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${month}-${String(d).padStart(2, '0')}`;

            let status = "-";
            if (teacherAtt[dateKey] && teacherAtt[dateKey][t.id]) {
                status = teacherAtt[dateKey][t.id];
            }

            let code = "-";
            if (status === "Present") { code = "P"; present++; }
            if (status === "Absent") { code = "A"; absent++; }
            if (status === "On Duty") { code = "OD"; duty++; }

            row.push(code);
        }
        row.push(present, absent, duty);
        reportData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(reportData);
    ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 25 }]; // Column widths
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teacher Attendance");

    const fileName = filterClass ? `Teacher_Report_${filterClass}_${month}.xlsx` : `Teacher_Report_All_${month}.xlsx`;
    XLSX.writeFile(wb, fileName);
    closeModal('reportModal');
}