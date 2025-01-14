let timer;
let isRunning = false;
let startTime;
let elapsedTime = 0;
let targetTime = 0;

const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const lapsContainer = document.querySelector('.laps');
const targetInput = document.getElementById('target');
const notificationElement = document.getElementById('notification');
const notificationSound = document.getElementById('notification-sound');

document.getElementById('start').addEventListener('click', startTimer);
document.getElementById('pause').addEventListener('click', pauseTimer);
document.getElementById('reset').addEventListener('click', resetTimer);
document.getElementById('lap').addEventListener('click', recordLap);

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        targetTime = parseInt(targetInput.value) * 1000 || 0;
        timer = setInterval(updateTime, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timer);
        elapsedTime = Date.now() - startTime;
    }
}

function resetTimer() {
    isRunning = false;
    clearInterval(timer);
    elapsedTime = 0;
    updateDisplay(0, 0, 0);
    lapsContainer.innerHTML = '<h2>Tours de piste</h2>';
    hideNotification();
}

function recordLap() {
    if (isRunning) {
        const lapTime = formatTime(elapsedTime);
        const lapElement = document.createElement('div');
        lapElement.textContent = lapTime;
        lapsContainer.appendChild(lapElement);
    }
}

function updateTime() {
    elapsedTime = Date.now() - startTime;
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    updateDisplay(hours, minutes, seconds);

    if (targetTime > 0 && elapsedTime >= targetTime) {
        clearInterval(timer);
        isRunning = false;
        showNotification();
        playNotificationSound();
    }
}

function updateDisplay(hours, minutes, seconds) {
    hoursElement.textContent = String(hours).padStart(2, '0');
    minutesElement.textContent = String(minutes).padStart(2, '0');
    secondsElement.textContent = String(seconds).padStart(2, '0');
}

function formatTime(time) {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showNotification() {
    notificationElement.style.display = 'block';
    setTimeout(hideNotification, 5000); // Hide after 5 seconds

    if (Notification.permission === 'granted') {
        new Notification('Temps écoulé !');
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Temps écoulé !');
            }
        });
    }
}

function hideNotification() {
    notificationElement.style.display = 'none';
}

function playNotificationSound() {
    notificationSound.play().catch(error => {
        console.error('Erreur lors de la lecture du son de notification:', error);
    });
}