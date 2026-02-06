let classes = JSON.parse(localStorage.getItem("classes")) || [];

/* RENDER LIST */
function render() {
    const list = document.getElementById("classList");
    list.innerHTML = "";

    if (classes.length === 0) {
        list.innerHTML = "<p style='color:#888; grid-column: 1/-1;'>No classes added yet.</p>";
        return;
    }

    classes.forEach((c, i) => {
        // We create a nicer looking card for the class
        list.innerHTML += `
        <div class="stat-card" style="text-align:left; padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <h2 style="font-size: 22px; color:#2d3436; margin-bottom:5px;">${c}</h2>
                    <p style="font-size:12px; color:#888;">Active Class</p>
                </div>
                <button class="action-btn btn-del" onclick="deleteClass(${i})">Delete</button>
            </div>
        </div>`;
    });
}

/* ADD CLASS - NOW COMBINES DROPDOWNS */
function addClass() {
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;
    const sem = document.getElementById("sem").value;
    const div = document.getElementById("div").value;

    // 1. Construct the Standardized Name
    // Example: "BCA FY (Sem-I) - A"
    let finalName = `${course} ${year} (Sem-${sem})`;

    // Only add Division if it's NOT "No Div"
    if (div !== "No Div") {
        finalName += ` - Div ${div}`;
    }

    // 2. Check for Duplicates
    if (classes.includes(finalName)) {
        alert("This class already exists! (" + finalName + ")");
        return;
    }

    // 3. Save
    classes.push(finalName);
    // Sort classes alphabetically so they look neat
    classes.sort();
    localStorage.setItem("classes", JSON.stringify(classes));

    render();
}

/* DELETE CLASS */
function deleteClass(index) {
    if (confirm("Are you sure? This will delete the class and all associated student data.")) {
        classes.splice(index, 1);
        localStorage.setItem("classes", JSON.stringify(classes));
        render();
    }
}

// Initial Load
render();