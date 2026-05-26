let isSimulationRunning = false;
let totalActivations = 0;
let lastDetectionTime = null;
let totalResponseTime = 0;

const simulateBtn = document.getElementById('simulateBtn');
const gateStatusBadge = document.getElementById('gateStatusBadge');
const gateStatusText = document.getElementById('gateStatusText');
const gatePositionText = document.getElementById('gatePositionText');
const gateArmLeft = document.querySelector('.gate-arm-left');
const gateArmRight = document.querySelector('.gate-arm-right');

const vehicleStatusBadge = document.getElementById('vehicleStatusBadge');
const vehicleStatusText = document.getElementById('vehicleStatusText');
const carSvgContainer = document.getElementById('carSvgContainer');
const vehicleDescription = document.getElementById('vehicleDescription');

const distanceValue = document.getElementById('distanceValue');
const distanceProgressBar = document.getElementById('distanceProgressBar');

const lastDetectionTimestamp_el = document.getElementById('lastDetectionTimestamp');
const timeAgo = document.getElementById('timeAgo');

const eventLog = document.getElementById('eventLog');
const totalActivationsCounter = document.getElementById('totalActivations');
const currentTimeDisplay = document.getElementById('currentTime');
const avgResponseTimeDisplay = document.getElementById('avgResponseTime');
const sensorBars = document.querySelectorAll('.sensor-bar');

simulateBtn.addEventListener('click', startSimulation);

window.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
    startClocks();
});

function initializeDashboard() {
    addEventLogEntry('Sensor online and operational', 'success');
    addEventLogEntry('System initialized', 'info');
    updateGateStatus('closed');
    updateVehicleDetection(false);
    updateDistance(185);
}

function startClocks() {
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeDisplay.textContent = hours + ':' + minutes + ':' + seconds;
    }
    updateTime();
    setInterval(updateTime, 1000);
    setInterval(updateTimeAgo, 1000);
}

function updateTimeAgo() {
    if (!lastDetectionTime) {
        timeAgo.textContent = '--';
        return;
    }
    const now = Date.now();
    const diffMs = now - lastDetectionTime;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) {
        const s = diffSecs !== 1 ? 's' : '';
        timeAgo.textContent = diffSecs + ' second' + s + ' ago';
    } else if (diffSecs < 3600) {
        const minutes = Math.floor(diffSecs / 60);
        const s = minutes !== 1 ? 's' : '';
        timeAgo.textContent = minutes + ' minute' + s + ' ago';
    } else {
        const hours = Math.floor(diffSecs / 3600);
        const s = hours !== 1 ? 's' : '';
        timeAgo.textContent = hours + ' hour' + s + ' ago';
    }
}

function startSimulation() {
    if (isSimulationRunning) return;
    isSimulationRunning = true;
    simulateBtn.disabled = true;
    simulateBtn.textContent = 'Processing...';
    totalActivations++;
    totalActivationsCounter.textContent = totalActivations;
    
    const startTime = Date.now();
    
    // Phase 1: Distance countdown from 185 to 7 (2 seconds)
    animateDistanceCountdown(185, 7, 2000, () => {
        // Phase 2: Vehicle detected
        updateVehicleDetection(true);
        carSvgContainer.classList.add('visible');
        lastDetectionTime = Date.now();
        updateDetectionTimestamp();
        addEventLogEntry('Vehicle detected at sensor range', 'green');
        
        // Phase 2.5: Gate opening command
        animateSensorBars();
        updateGateStatus('opening');
        gateArmLeft.classList.add('opening');
        gateArmRight.classList.add('opening');
        addEventLogEntry('Gate opening command sent', 'blue');
        
        // Wait 1 second, then gate open
        setTimeout(() => {
            updateGateStatus('open');
            addEventLogEntry('Gate fully open', 'green');
            
            // Keep gate open for 2 seconds
            setTimeout(() => {
                // Phase 3: Vehicle clears
                addEventLogEntry('Vehicle cleared sensor zone', 'amber');
                
                // Phase 4: Distance jumps to 98cm
                updateDistance(98);
                updateDistanceProgressBar(98);
                
                // Phase 5: Gate closing
                updateGateStatus('closing');
                addEventLogEntry('Gate closing — path clear', 'amber');
                
                // Wait 1 second, then gate closed
                setTimeout(() => {
                    gateArmLeft.classList.remove('opening');
                    gateArmRight.classList.remove('opening');
                    gateArmLeft.classList.add('closing');
                    gateArmRight.classList.add('closing');
                    
                    setTimeout(() => {
                        updateGateStatus('closed');
                        updateVehicleDetection(false);
                        carSvgContainer.classList.remove('visible');
                        gateArmLeft.classList.remove('closing');
                        gateArmRight.classList.remove('closing');
                        
                        // Distance returns to 185
                        animateDistanceCountdown(98, 185, 1000, () => {
                            addEventLogEntry('Gate closed and secured', 'red');
                            
                            // Calculate response time
                            const responseTime = (Date.now() - startTime) / 1000;
                            totalResponseTime += responseTime;
                            const avgTime = (totalResponseTime / totalActivations).toFixed(1);
                            avgResponseTimeDisplay.textContent = avgTime + 's';
                            
                            // Reset
                            isSimulationRunning = false;
                            simulateBtn.disabled = false;
                            simulateBtn.textContent = '🚗 Simulate Vehicle Detection';
                            sensorBars.forEach(bar => bar.style.height = '20px');
                        });
                    }, 700);
                }, 1000);
            }, 2000);
        }, 1000);
    });
}

function animateDistanceCountdown(from, to, duration, callback) {
    const startTime = Date.now();
    const distance = to - from;
    
    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentDistance = from + (distance * progress);
        
        updateDistance(Math.round(currentDistance));
        updateDistanceProgressBar(Math.round(currentDistance));
        
        if (progress >= 1) {
            clearInterval(interval);
            callback();
        }
    }, 30);
}

function animateSensorBars() {
    const interval = setInterval(() => {
        if (!isSimulationRunning) {
            clearInterval(interval);
            sensorBars.forEach(bar => bar.style.height = '20px');
            return;
        }
        sensorBars.forEach(bar => {
            const randomHeight = Math.random() * 60 + 10;
            bar.style.height = randomHeight + 'px';
        });
    }, 100);
}

function updateGateStatus(status) {
    gateStatusBadge.className = 'status-badge status-' + status;
    switch (status) {
        case 'closed':
            gateStatusText.textContent = 'Gate Closed';
            gatePositionText.textContent = 'CLOSED';
            break;
        case 'opening':
            gateStatusText.textContent = 'Gate Opening...';
            gatePositionText.textContent = 'OPENING';
            break;
        case 'open':
            gateStatusText.textContent = 'Gate Open';
            gatePositionText.textContent = 'OPEN';
            break;
        case 'closing':
            gateStatusText.textContent = 'Gate Closing...';
            gatePositionText.textContent = 'CLOSING';
            break;
    }
}

function updateVehicleDetection(detected) {
    if (detected) {
        vehicleStatusBadge.className = 'status-badge status-success';
        vehicleStatusText.textContent = '● Vehicle Detected';
        vehicleDescription.textContent = 'Vehicle detected in sensor range';
    } else {
        vehicleStatusBadge.className = 'status-badge status-idle';
        vehicleStatusText.textContent = 'No Vehicle Detected';
        vehicleDescription.textContent = 'Waiting for vehicle...';
    }
}

function updateDistance(distance) {
    if (distance === null) {
        distanceValue.textContent = '185';
    } else {
        distanceValue.textContent = distance;
    }
}

function updateDistanceProgressBar(distance) {
    if (distance === null) {
        distanceProgressBar.style.width = '92.5%';
    } else {
        const percentage = (distance / 200) * 100;
        distanceProgressBar.style.width = percentage + '%';
    }
}

function updateDetectionTimestamp() {
    const now = new Date();
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    const formatted = now.toLocaleDateString('en-US', options);
    lastDetectionTimestamp_el.textContent = formatted;
    updateTimeAgo();
}

function addEventLogEntry(message, type) {
    if (type === undefined) type = 'info';
    const entry = document.createElement('div');
    entry.className = 'event-log-entry ' + type;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = hours + ':' + minutes + ':' + seconds;
    entry.innerHTML = '<span class="event-log-time">' + timeStr + '</span><span class="event-log-message">' + message + '</span>';
    eventLog.insertBefore(entry, eventLog.firstChild);
    while (eventLog.children.length > 8) {
        eventLog.removeChild(eventLog.lastChild);
    }
}
