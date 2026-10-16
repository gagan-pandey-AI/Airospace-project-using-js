// ============================================
// AEROMANAGE - AIRPORT MANAGEMENT SYSTEM
// HTML, CSS AND JAVASCRIPT
// ============================================


// 1. SAMPLE FLIGHT DATA

const defaultFlights = [
    {
        id: "F101",
        number: "AI202",
        destination: "Mumbai",
        type: "Departure",
        time: "10:30",
        gate: "G05",
        status: "Boarding"
    },
    {
        id: "F102",
        number: "UK804",
        destination: "Delhi",
        type: "Arrival",
        time: "10:45",
        gate: "G02",
        status: "On Time"
    },
    {
        id: "F103",
        number: "6E501",
        destination: "Bengaluru",
        type: "Departure",
        time: "11:15",
        gate: "G08",
        status: "Delayed"
    },
    {
        id: "F104",
        number: "AI405",
        destination: "Kolkata",
        type: "Arrival",
        time: "11:30",
        gate: "G04",
        status: "Landed"
    },
    {
        id: "F105",
        number: "6E210",
        destination: "Hyderabad",
        type: "Departure",
        time: "12:00",
        gate: "G06",
        status: "Scheduled"
    }
];


// 2. SAMPLE PASSENGER DATA

const defaultPassengers = [
    {
        id: "PAX1001",
        name: "Rahul Sharma",
        flight: "AI202",
        seat: "12A",
        stage: 4
    },
    {
        id: "PAX1002",
        name: "Priya Verma",
        flight: "AI202",
        seat: "14B",
        stage: 2
    },
    {
        id: "PAX1003",
        name: "Aman Singh",
        flight: "UK804",
        seat: "08C",
        stage: 1
    },
    {
        id: "PAX1004",
        name: "Neha Gupta",
        flight: "6E501",
        seat: "16A",
        stage: 3
    },
    {
        id: "PAX1005",
        name: "Arjun Kumar",
        flight: "AI405",
        seat: "09D",
        stage: 0
    },
    {
        id: "PAX1006",
        name: "Ananya Das",
        flight: "6E210",
        seat: "18F",
        stage: 2
    }
];


// 3. LOAD DATA

function loadData(key, fallback) {
    try {
        const saved = localStorage.getItem(key);

        if (saved === null) {
            return fallback.map(item => ({ ...item }));
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            throw new Error("Invalid saved data");
        }

        return parsed;

    } catch (error) {
        console.error("Unable to load data:", error);

        return fallback.map(item => ({ ...item }));
    }
}


let flights = loadData(
    "aeromanage_flights",
    defaultFlights
);

let passengers = loadData(
    "aeromanage_passengers",
    defaultPassengers
);


// 4. SAVE DATA

function saveData() {
    try {
        localStorage.setItem(
            "aeromanage_flights",
            JSON.stringify(flights)
        );

        localStorage.setItem(
            "aeromanage_passengers",
            JSON.stringify(passengers)
        );

        return true;

    } catch (error) {
        console.error("Unable to save data:", error);

        showToast("Unable to save data.");

        return false;
    }
}


// 5. PASSENGER PROCESSING STAGES

const stages = [
    "Not Checked In",
    "Checked In",
    "Baggage Checked",
    "Security Cleared",
    "Boarded"
];


function getPassengerStatus(passenger) {
    return stages[passenger.stage] || stages[0];
}


// 6. SAFE HTML OUTPUT

function escapeHTML(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(
        /[&<>"']/g,
        character => entities[character]
    );
}


// 7. STATUS BADGES

function getBadgeClass(status) {
    const classes = {
        "Boarding": "purple",
        "On Time": "green",
        "Landed": "green",
        "Delayed": "orange",
        "Scheduled": "blue",
        "Cancelled": "gray",

        "Not Checked In": "gray",
        "Checked In": "blue",
        "Baggage Checked": "orange",
        "Security Cleared": "green",
        "Boarded": "purple"
    };

    return classes[status] || "gray";
}


function createBadge(status) {
    return `
        <span class="badge ${getBadgeClass(status)}">
            ${escapeHTML(status)}
        </span>
    `;
}


// 8. DASHBOARD STATISTICS

function updateDashboard() {

    const departures = flights.filter(
        flight => flight.type === "Departure"
    ).length;

    const arrivals = flights.filter(
        flight => flight.type === "Arrival"
    ).length;


    document.getElementById("totalFlights").textContent =
        flights.length;

    document.getElementById("totalDepartures").textContent =
        departures;

    document.getElementById("totalArrivals").textContent =
        arrivals;

    document.getElementById("totalPassengers").textContent =
        passengers.length;


    const checkedIn = passengers.filter(
        passenger => passenger.stage >= 1
    ).length;

    const baggage = passengers.filter(
        passenger => passenger.stage >= 2
    ).length;

    const security = passengers.filter(
        passenger => passenger.stage >= 3
    ).length;

    const boarded = passengers.filter(
        passenger => passenger.stage >= 4
    ).length;


    document.getElementById("checkedInCount").textContent =
        checkedIn;

    document.getElementById("baggageCount").textContent =
        baggage;

    document.getElementById("securityCount").textContent =
        security;

    document.getElementById("boardedCount").textContent =
        boarded;


    updateProgress("checkedInBar", checkedIn);
    updateProgress("baggageBar", baggage);
    updateProgress("securityBar", security);
    updateProgress("boardedBar", boarded);


    const total = passengers.length;

    const completion = total === 0
        ? 0
        : Math.round((boarded / total) * 100);


    document.getElementById("completionRate").textContent =
        completion + "%";

    document.getElementById("completionBar").style.width =
        completion + "%";

    document.getElementById("analyticsSummary").textContent =
        `${boarded} of ${total} registered passengers have completed boarding.`;
}


function updateProgress(elementId, count) {

    const total = passengers.length;

    const percentage = total === 0
        ? 0
        : Math.round((count / total) * 100);

    document.getElementById(elementId).style.width =
        percentage + "%";
}


// 9. DISPLAY FLIGHTS

function renderFlights() {

    const tbody = document.getElementById("flightTableBody");

    const search = document.getElementById("flightSearch")
        .value.trim().toLowerCase();

    const filter = document.getElementById("flightFilter").value;


    const filteredFlights = flights.filter(flight => {

        const matchesSearch =
            flight.number.toLowerCase().includes(search) ||
            flight.destination.toLowerCase().includes(search);

        const matchesType =
            filter === "All" || flight.type === filter;

        return matchesSearch && matchesType;
    });


    if (filteredFlights.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">No matching flights found.</td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = filteredFlights.map(flight => `
        <tr>
            <td>
                <span class="flight-code">
                    ${escapeHTML(flight.number)}
                </span>
            </td>

            <td>${escapeHTML(flight.destination)}</td>

            <td>${escapeHTML(flight.type)}</td>

            <td>${escapeHTML(flight.time)}</td>

            <td>${escapeHTML(flight.gate)}</td>

            <td>${createBadge(flight.status)}</td>
        </tr>
    `).join("");
}


// 10. DISPLAY PASSENGERS

function renderPassengers() {

    const tbody = document.getElementById("passengerTableBody");

    const search = document.getElementById("passengerSearch")
        .value.trim().toLowerCase();

    const filter = document.getElementById(
        "passengerStatusFilter"
    ).value;


    const filteredPassengers = passengers.filter(passenger => {

        const matchesSearch =
            passenger.name.toLowerCase().includes(search) ||
            passenger.id.toLowerCase().includes(search) ||
            passenger.flight.toLowerCase().includes(search);

        const matchesStatus =
            filter === "All" ||
            getPassengerStatus(passenger) === filter;

        return matchesSearch && matchesStatus;
    });


    if (filteredPassengers.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">No matching passengers found.</td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML = filteredPassengers.map(passenger => {

        const flight = flights.find(
            item => item.number === passenger.flight
        );

        const flightName = flight
            ? `${flight.number} · ${flight.destination}`
            : passenger.flight;

        const currentStatus = getPassengerStatus(passenger);

        const canAdvance =
            passenger.stage < 4 &&
            flight &&
            flight.type === "Departure" &&
            !["Cancelled", "Delayed"].includes(flight.status);


        const actionLabels = [
            "Check In",
            "Check Baggage",
            "Clear Security",
            "Board",
            "Completed"
        ];

        const actionText = actionLabels[passenger.stage] ||
            "Completed";


        return `
            <tr>
                <td>
                    <span class="passenger-name">
                        ${escapeHTML(passenger.name)}
                    </span>

                    <div class="sub-text">Passenger</div>
                </td>

                <td>${escapeHTML(passenger.id)}</td>

                <td>
                    <span class="flight-code">
                        ${escapeHTML(flightName)}
                    </span>
                </td>

                <td>${escapeHTML(passenger.seat)}</td>

                <td>${createBadge(currentStatus)}</td>

                <td>
                    <button
                        class="row-button"
                        data-action="advance"
                        data-id="${escapeHTML(passenger.id)}"
                        ${!canAdvance ? "disabled" : ""}
                    >
                        ${actionText}
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


// 11. ADVANCE PASSENGER PROCESSING

function advancePassenger(passengerId) {

    const passenger = passengers.find(
        item => item.id === passengerId
    );

    if (!passenger || passenger.stage >= 4) {
        return;
    }


    const flight = flights.find(
        item => item.number === passenger.flight
    );


    if (!flight || flight.type !== "Departure") {

        showToast(
            "Processing is available for departure flights."
        );

        return;
    }


    if (["Cancelled", "Delayed"].includes(flight.status)) {

        showToast("This flight is delayed or cancelled.");

        return;
    }


    passenger.stage += 1;

    saveData();

    renderAll();

    showToast(
        `${passenger.name}: ${getPassengerStatus(passenger)}`
    );
}


// 12. PASSENGER FORM

const modal = document.getElementById("passengerModal");

const passengerForm = document.getElementById("passengerForm");


function openModal() {

    const flightSelect = document.getElementById("passengerFlight");

    const availableFlights = flights.filter(flight =>
        flight.type === "Departure" &&
        !["Cancelled", "Delayed", "Boarding"].includes(
            flight.status
        )
    );


    flightSelect.innerHTML = availableFlights.map(flight => `
        <option value="${escapeHTML(flight.number)}">
            ${escapeHTML(flight.number)} — ${escapeHTML(flight.destination)}
        </option>
    `).join("");


    if (availableFlights.length === 0) {

        showToast("No suitable departure flights available.");

        return;
    }


    modal.hidden = false;

    document.getElementById("passengerName").focus();
}


function closeModal() {

    modal.hidden = true;

    passengerForm.reset();
}


// OPEN AND CLOSE MODAL

document.getElementById("addPassengerBtn").addEventListener(
    "click",
    openModal
);


document.getElementById("closeModalBtn").addEventListener(
    "click",
    closeModal
);


document.getElementById("cancelModalBtn").addEventListener(
    "click",
    closeModal
);


modal.addEventListener("click", event => {

    if (event.target === modal) {
        closeModal();
    }

});


// 13. ADD NEW PASSENGER

passengerForm.addEventListener("submit", event => {

    event.preventDefault();


    const name = document.getElementById("passengerName")
        .value.trim();

    const flightNumber = document.getElementById("passengerFlight")
        .value;

    const seat = document.getElementById("passengerSeat")
        .value.trim().toUpperCase();


    if (!name || !flightNumber || !seat) {

        showToast("Please complete all fields.");

        return;
    }


    const flight = flights.find(
        item => item.number === flightNumber
    );


    if (
        !flight ||
        flight.type !== "Departure" ||
        ["Cancelled", "Delayed", "Boarding"].includes(flight.status)
    ) {

        showToast("Select a valid available departure flight.");

        return;
    }


    const seatTaken = passengers.some(passenger =>
        passenger.flight === flightNumber &&
        passenger.seat.toUpperCase() === seat
    );


    if (seatTaken) {

        showToast("This seat is already assigned on that flight.");

        return;
    }


    const nextIdNumber = passengers.reduce(
        (maximum, passenger) => {

            const match = passenger.id.match(/^PAX(\d+)$/);

            return match
                ? Math.max(maximum, Number(match[1]))
                : maximum;

        },
        1000
    ) + 1;


    const newPassenger = {
        id: `PAX${nextIdNumber}`,
        name: name,
        flight: flightNumber,
        seat: seat,
        stage: 0
    };


    passengers.push(newPassenger);

    saveData();

    closeModal();

    renderAll();

    showToast("Passenger added successfully.");

});


// 14. PASSENGER ACTION BUTTONS

document.getElementById("passengerTableBody")
    .addEventListener("click", event => {

        const button = event.target.closest(
            'button[data-action="advance"]'
        );

        if (!button || button.disabled) {
            return;
        }

        advancePassenger(button.dataset.id);

    });


// 15. SEARCH AND FILTER

document.getElementById("flightSearch").addEventListener(
    "input",
    renderFlights
);


document.getElementById("flightFilter").addEventListener(
    "change",
    renderFlights
);


document.getElementById("passengerSearch").addEventListener(
    "input",
    renderPassengers
);


document.getElementById("passengerStatusFilter").addEventListener(
    "change",
    renderPassengers
);


// 16. LIVE CLOCK

function updateClock() {

    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
}


updateClock();

setInterval(updateClock, 1000);


// 17. TOAST NOTIFICATIONS

let toastTimer;


function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2800);
}


// 18. RENDER APPLICATION

function renderAll() {

    updateDashboard();

    renderFlights();

    renderPassengers();
}


// 19. START APPLICATION

renderAll();

console.log(
    "AeroManage Airport Management System Started Successfully!"
);






















