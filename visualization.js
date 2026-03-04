const API_URL = 'http://localhost:3000/api';

class ElevatorVisualizer {
    constructor() {
        this.maxFloor = 10;
        this.isDispatching = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderFloors();
        this.updateDisplay();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    setupEventListeners() {
        document.getElementById('addPersonBtn').addEventListener('click', () => this.addPerson());
        document.getElementById('dispatchBtn').addEventListener('click', () => this.dispatchElevator());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());
    }

    renderFloors() {
        const floorsDisplay = document.getElementById('floorsDisplay');
        floorsDisplay.innerHTML = '';
        
        for (let floor = this.maxFloor; floor >= 0; floor--) {
            const floorDiv = document.createElement('div');
            floorDiv.className = 'floor';
            floorDiv.id = `floor-${floor}`;
            floorDiv.innerHTML = `
                <div class="floor-label">Floor ${floor}</div>
                <div class="floor-people" id="floor-people-${floor}"></div>
            `;
            floorsDisplay.appendChild(floorDiv);
        }
    }

    async addPerson() {
        const nameInput = document.getElementById('personName');
        const currentFloorSelect = document.getElementById('currentFloor');
        const dropOffFloorSelect = document.getElementById('dropOffFloor');

        const name = nameInput.value.trim();
        const currentFloor = parseInt(currentFloorSelect.value);
        const dropOffFloor = parseInt(dropOffFloorSelect.value);

        if (!name) {
            alert('Please enter a person\'s name');
            return;
        }

        if (currentFloor === dropOffFloor) {
            alert('Current floor must be different from drop-off floor');
            return;
        }

        try {
            // API call to add person to requests
            await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, currentFloor, dropOffFloor })
            });

            nameInput.value = '';
            currentFloorSelect.value = '0';
            dropOffFloorSelect.value = '0';

            this.updateDisplay();
        } catch (error) {
            console.error('Error adding person:', error);
            alert('Failed to add person');
        }
    }

    async dispatchElevator() {
        if (this.isDispatching) return;
        
        const requests = await fetch(`${API_URL}/requests`).then(r => r.json());
        const riders = await fetch(`${API_URL}/riders`).then(r => r.json());

        if (requests.length === 0 && riders.length === 0) {
            alert('No requests or riders');
            return;
        }

        this.isDispatching = true;
        document.getElementById('dispatchBtn').disabled = true;

        try {
            // API call to dispatch
            await fetch(`${API_URL}/elevator/dispatch`, { method: 'POST' });
            this.updateDisplay();
        } catch (error) {
            console.error('Error dispatching:', error);
            alert('Failed to dispatch elevator');
        }

        this.isDispatching = false;
        document.getElementById('dispatchBtn').disabled = false;
    }

    async updateDisplay() {
        try {
            // Fetch elevator state
            const elevatorState = await fetch(`${API_URL}/elevator`).then(r => r.json());
            const requests = await fetch(`${API_URL}/requests`).then(r => r.json());
            const riders = await fetch(`${API_URL}/riders`).then(r => r.json());

            // Update stats
            document.getElementById('stopsCount').textContent = elevatorState.stops;
            document.getElementById('floorsCount').textContent = elevatorState.floorsTraversed;
            document.getElementById('currentFloorDisplay').textContent = elevatorState.currentFloor;

            // Update requests list
            const requestsList = document.getElementById('requestsList');
            requestsList.innerHTML = '';
            if (requests.length === 0) {
                requestsList.innerHTML = '<div style="color: #a0aec0; font-size: 14px;">No pending requests</div>';
            } else {
                requests.forEach(person => {
                    const item = document.createElement('div');
                    item.className = 'queue-item';
                    item.innerHTML = `
                        <div class="queue-item-name">${person.name}</div>
                        <div class="queue-item-floors">Floor ${person.currentFloor} → Floor ${person.dropOffFloor}</div>
                    `;
                    requestsList.appendChild(item);
                });
            }

            // Update riders list
            const ridersList = document.getElementById('ridersList');
            ridersList.innerHTML = '';
            if (riders.length === 0) {
                ridersList.innerHTML = '<div style="color: #a0aec0; font-size: 14px;">No current riders</div>';
            } else {
                riders.forEach(person => {
                    const item = document.createElement('div');
                    item.className = 'queue-item';
                    item.innerHTML = `
                        <div class="queue-item-name">${person.name}</div>
                        <div class="queue-item-floors">→ Floor ${person.dropOffFloor}</div>
                    `;
                    ridersList.appendChild(item);
                });
            }

            // Update people badges on floors
            for (let floor = 0; floor <= this.maxFloor; floor++) {
                const floorPeople = document.getElementById(`floor-people-${floor}`);
                floorPeople.innerHTML = '';

                requests.forEach(person => {
                    if (person.currentFloor === floor) {
                        const badge = document.createElement('div');
                        badge.className = 'person-badge';
                        badge.textContent = `📍 ${person.name}`;
                        floorPeople.appendChild(badge);
                    }
                });
            }

            // Update riders in elevator
            const ridersInElevator = document.getElementById('ridersInElevator');
            ridersInElevator.innerHTML = '';
            riders.forEach(person => {
                const rider = document.createElement('div');
                rider.className = 'rider-in-elevator';
                rider.textContent = `${person.name} → ${person.dropOffFloor}`;
                ridersInElevator.appendChild(rider);
            });

            // Update elevator position
            const floorHeight = 100 / (this.maxFloor + 1);
            const bottomPosition = elevatorState.currentFloor * floorHeight;
            document.getElementById('elevator').style.bottom = `${bottomPosition}%`;

        } catch (error) {
            console.error('Error updating display:', error);
        }
    }

    async resetSimulation() {
        try {
            await fetch(`${API_URL}/elevator/reset`, { method: 'POST' });
            this.updateDisplay();
        } catch (error) {
            console.error('Error resetting:', error);
            alert('Failed to reset elevator');
        }
    }

    updateTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        document.getElementById('timeDisplay').textContent = timeString;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ElevatorVisualizer();
});
