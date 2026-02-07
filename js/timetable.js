/* ===========================
   CONFIG & DATA
=========================== */
const classes = JSON.parse(localStorage.getItem("classes")) || [];
const teachers = JSON.parse(localStorage.getItem("teachers")) || [];

// Main Data Structure: { "BCA FY": { "Mon-0": {...}, "Tue-1": {...} } }
let timetableData = JSON.parse(localStorage.getItem("timetable")) || {};

// Slot Definitions
const timeSlots = [
    { label: "10:15 - 11:00", type: "slot" },
    { label: "11:00 - 11:45", type: "slot" },
    { label: "SHORT BREAK", type: "break" },
    { label: "11:55 - 12:40", type: "slot" },
    { label: "12:40 - 01:25", type: "slot" },
    { label: "LUNCH BREAK", type: "break" },
    { label: "01:55 - 02:40", type: "slot" },
    { label: "02:40 - 03:25", type: "slot" },
    { label: "03:25 - 04:10", type: "slot" }
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Selection State
let selectedClass = "";
let currentDay = "";
let currentSlotIndex = -1;

/* ===========================
   INIT
=========================== */
document.addEventListener("DOMContentLoaded", () => {
    // Load Class Dropdown
    const sel = document.getElementById("classSelect");
    sel.innerHTML = `<option value="">Select Class...</option>` +
        classes.map(c => `<option value="${c}">${c}</option>`).join("");

    // Load Teachers into Modal Dropdowns
    const teacherOptions = `<option value="">Select Teacher...</option>` +
        teachers.map(t => `<option value="${t.name}">${t.name}</option>`).join("");

    document.querySelectorAll(".teacher-list").forEach(s => s.innerHTML = teacherOptions);
});

/* ===========================
   RENDER TABLE
=========================== */
function loadTimetable() {
    selectedClass = document.getElementById("classSelect").value;
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (!selectedClass) {
        tbody.innerHTML = "<tr><td colspan='7' style='padding:30px; color:#aaa;'>Please select a class to view timetable.</td></tr>";
        return;
    }

    // Ensure storage object exists for this class
    if (!timetableData[selectedClass]) timetableData[selectedClass] = {};

    let slotCounter = 0;

    timeSlots.forEach((slot, index) => {
        if (slot.type === "break") {
            // Render Break Row
            tbody.innerHTML += `
            <tr class="break-row">
                <td colspan="7">${slot.label}</td>
            </tr>`;
        } else {
            // Render Teaching Slot Row
            let rowHtml = `<tr><td class="time-col">${slot.label}</td>`;

            days.forEach(day => {
                const key = `${day}-${index}`; // Unique Key: Mon-0
                const session = timetableData[selectedClass][key];

                // Check if this slot is occupied by a previous "Practical" (2 slots)
                const prevIndex = index - 1;
                const prevKey = `${day}-${prevIndex}`;
                const prevSession = timetableData[selectedClass][prevKey];

                if (prevSession && prevSession.type === "Practical" && timeSlots[prevIndex].type === "slot") {
                    rowHtml += `<td style="background:#f3e5f5; color:#9c27b0; font-size:11px; vertical-align:middle;">
                        <i>(Cont. Practical)</i>
                     </td>`;
                }
                else if (session) {
                    // Render Active Session Card
                    let cardContent = "";

                    if (session.type === "Theory") {
                        cardContent = `
                        <div class="session-card" onclick="editSession('${day}', ${index})">
                            <b>${session.subject}</b><br>
                            <span style="font-size:11px; color:#666;">${session.teacher}</span>
                        </div>`;
                    } else {
                        // Practical Display
                        cardContent = `
                        <div class="session-card session-practical" onclick="editSession('${day}', ${index})">
                            <b>${session.subject} (Practical)</b><br>
                            <div style="margin-top:4px; text-align:left;">
                                <div class="batch-badge">A</div> ${session.teacherA} <span style="color:#666">(${session.labA})</span><br>
                                <div class="batch-badge">B</div> ${session.teacherB} <span style="color:#666">(${session.labB})</span>
                            </div>
                        </div>`;
                    }
                    rowHtml += `<td>${cardContent}</td>`;
                } else {
                    // Empty Slot -> Show Add Button
                    rowHtml += `<td><button class="add-slot-btn" onclick="openAddModal('${day}', ${index})">+</button></td>`;
                }
            });

            rowHtml += `</tr>`;
            tbody.innerHTML += rowHtml;
            slotCounter++;
        }
    });
}

/* ===========================
   MODAL LOGIC
=========================== */
function toggleBatches() {
    const type = document.getElementById("sType").value;
    const theoryBox = document.getElementById("theoryInputs");
    const batchBox = document.getElementById("batchInputs");

    if (type === "Practical") {
        theoryBox.style.display = "none";
        batchBox.style.display = "block";
    } else {
        theoryBox.style.display = "block";
        batchBox.style.display = "none";
    }
}

function openAddModal(day, index) {
    currentDay = day;
    currentSlotIndex = index;

    // Reset Form
    document.getElementById("modalTitle").innerText = `Add Session (${day})`;
    document.getElementById("sType").value = "Theory";
    document.getElementById("sSubject").value = "";
    document.getElementById("sTeacher").value = "";

    // Reset Batch Fields
    document.getElementById("sTeacherA").value = "";
    document.getElementById("sLabA").value = "";
    document.getElementById("sTeacherB").value = "";
    document.getElementById("sLabB").value = "";

    document.getElementById("btnDelete").style.display = "none";
    toggleBatches();

    document.getElementById("sessionModal").classList.add("active");
}

function editSession(day, index) {
    currentDay = day;
    currentSlotIndex = index;
    const key = `${day}-${index}`;
    const data = timetableData[selectedClass][key];

    // Fill Form
    document.getElementById("modalTitle").innerText = `Edit Session (${day})`;
    document.getElementById("sType").value = data.type;
    document.getElementById("sSubject").value = data.subject;

    if (data.type === "Theory") {
        document.getElementById("sTeacher").value = data.teacher;
    } else {
        document.getElementById("sTeacherA").value = data.teacherA;
        document.getElementById("sLabA").value = data.labA;
        document.getElementById("sTeacherB").value = data.teacherB;
        document.getElementById("sLabB").value = data.labB;
    }

    toggleBatches();
    document.getElementById("btnDelete").style.display = "inline-block";
    document.getElementById("sessionModal").classList.add("active");
}

/* ===========================
   SAVE / DELETE / CLOSE
=========================== */
function saveSession() {
    const type = document.getElementById("sType").value;
    const subject = document.getElementById("sSubject").value;

    if (!subject) { alert("Subject Name is required"); return; }

    const sessionObj = { type, subject };

    if (type === "Theory") {
        sessionObj.teacher = document.getElementById("sTeacher").value;
        if (!sessionObj.teacher) { alert("Select a teacher"); return; }
    } else {
        // Practical Validation
        sessionObj.teacherA = document.getElementById("sTeacherA").value;
        sessionObj.labA = document.getElementById("sLabA").value;
        sessionObj.teacherB = document.getElementById("sTeacherB").value;
        sessionObj.labB = document.getElementById("sLabB").value;

        if (!sessionObj.teacherA || !sessionObj.teacherB) {
            alert("Select teachers for both batches"); return;
        }
    }

    const key = `${currentDay}-${currentSlotIndex}`;
    timetableData[selectedClass][key] = sessionObj;

    localStorage.setItem("timetable", JSON.stringify(timetableData));

    closeModal("sessionModal");
    loadTimetable();
}

function deleteSession() {
    if (confirm("Delete this session?")) {
        const key = `${currentDay}-${currentSlotIndex}`;
        delete timetableData[selectedClass][key];
        localStorage.setItem("timetable", JSON.stringify(timetableData));
        closeModal("sessionModal");
        loadTimetable();
    }
}

// THIS IS THE MISSING FUNCTION!
function closeModal(id) {
    document.getElementById(id).classList.remove("active");
}