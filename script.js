const data = {
    "Travel & Transportation": [
        { action: "Walked or cycled", points: 1 },
        { action: "Used public transport", points: 2 },
        { action: "Carpooled or rideshared", points: 3 },
        { action: "Turned off engine when idling", points: 1 },
        { action: "Used an electric/hybrid vehicle", points: 3 }
    ],
    "Home & Energy Use": [
        { action: "Turned off lights and devices", points: 1 },
        { action: "Used LED bulbs", points: 2 },
        { action: "Reduced AC/heating use", points: 2 },
        { action: "Ventilated naturally", points: 1 }
    ],
    "Food & Diet": [
        { action: "Ate plant-based meals", points: 3 },
        { action: "Used reusable bags and bottles", points: 1 },
        { action: "Reduced food waste", points: 2 },
        { action: "Avoided packaged drinks", points: 1 }
    ],
    "Workplace & Study": [
        { action: "Used digital notes", points: 1 },
        { action: "Printed only when needed", points: 1 },
        { action: "Turned off devices", points: 1 },
        { action: "Used a reusable mug", points: 1 }
    ],
    "Waste Management": [
        { action: "Recycled", points: 2 },
        { action: "Avoided single-use plastics", points: 2 },
        { action: "Reused or upcycled items", points: 3 }
    ],
    "Water Conservation": [
        { action: "Took short showers", points: 2 },
        { action: "Fixed leaks or turned off taps", points: 1 },
        { action: "Used water-efficient fixtures", points: 2 }
    ],
    "Nature & Outdoor Activities": [
        { action: "Planted a tree or cared for plants", points: 3 },
        { action: "Participated in clean-ups", points: 2 },
        { action: "Used eco-friendly products", points: 2 }
    ],
    "Shopping & Consumption": [
        { action: "Bought second-hand", points: 2 },
        { action: "Chose minimal packaging", points: 2 },
        { action: "Supported sustainable brands", points: 3 },
        { action: "Used a reusable shopping bag", points: 1 }
    ]
};

function loadSelections() {
    return JSON.parse(localStorage.getItem("selections")) || {};
}

function saveSelection(category, action, isChecked) {
    let selections = loadSelections();
    if (!selections[category]) selections[category] = {};
    selections[category][action] = isChecked;
    localStorage.setItem("selections", JSON.stringify(selections));
    checkSubmitEnabled();
}

function checkSubmitEnabled() {
    let selections = loadSelections();
    let hasSelection = Object.values(selections).some(actions => Object.values(actions).includes(true));
    let alreadySubmitted = localStorage.getItem("submittedToday") === new Date().toDateString();
    
    document.getElementById('submit-btn').disabled = !hasSelection || alreadySubmitted;
}

function showInfo(category) {
    const infoBox = document.getElementById('info');
    const selections = loadSelections();

    infoBox.innerHTML = `<h3>${category}</h3>` +
        data[category].map(item => {
            const checked = selections[category]?.[item.action] ? "checked" : "";
            return `<label><input type='checkbox' ${checked} onchange="saveSelection('${category}', '${item.action}', this.checked)"> ${item.action} (${item.points} pts)</label>`;
        }).join('');

    infoBox.style.display = 'block';
}

function submitData() {
    let totalPoints = 0;
    let selections = loadSelections();
    
    for (let category in selections) {
        for (let action in selections[category]) {
            if (selections[category][action]) {
                totalPoints += data[category].find(item => item.action === action)?.points || 0;
            }
        }
    }

    const today = new Date().toDateString();
    localStorage.setItem("submittedToday", today);
    localStorage.setItem("dailyPoints", totalPoints);

    let weeklyPoints = parseInt(localStorage.getItem("weeklyPoints") || 0) + totalPoints;
    localStorage.setItem("weeklyPoints", weeklyPoints);

    let streak = parseInt(localStorage.getItem("streak") || 0);
    if (localStorage.getItem("lastActionDate") !== today) {
        streak++;
        localStorage.setItem("lastActionDate", today);
        localStorage.setItem("streak", streak);
    }

    document.getElementById("points-box").textContent = `You earned ${totalPoints} points today!`;
    document.getElementById("streak-box").textContent = `Your streak: ${streak} days`;
    document.getElementById("weekly-box").textContent = `Weekly total: ${weeklyPoints} points`;

    document.getElementById("results-screen").style.display = "block";
}

checkSubmitEnabled();