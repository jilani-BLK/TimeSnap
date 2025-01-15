let timer;
let isRunning = false;
let elapsedTime = 0;
let startTime = 0;

const display = document.querySelector('.timer');
const playPauseButton = document.querySelector('#play-pause');
const resetButton = document.querySelector('#reset');
const saveButton = document.querySelector('#save');
const savedTimesList = document.querySelector('.saved-times ul');
const soundSelect = document.querySelector('#sound-select');
const sound1 = new Audio('notification1.mp3');
const sound2 = new Audio('notification2.mp3');

sound1.volume = 1.0;
sound2.volume = 1.0;

function updateDisplay() {
    const totalMilliseconds = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = totalMilliseconds % 1000;
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now();
        timer = setInterval(updateDisplay, 10);
        playPauseButton.textContent = 'Pause';
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        elapsedTime += Date.now() - startTime;
        clearInterval(timer);
        playPauseButton.textContent = 'Démarrer';
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = 0;
    startTime = 0;
    updateDisplay();
    playPauseButton.textContent = 'Démarrer';
}

function saveTime() {
    const totalMilliseconds = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = totalMilliseconds % 1000;
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;

    const li = document.createElement('li');
    li.textContent = timeString;
    savedTimesList.appendChild(li);

    const savedTimes = JSON.parse(localStorage.getItem('savedTimes')) || [];
    savedTimes.push(timeString);
    localStorage.setItem('savedTimes', JSON.stringify(savedTimes));
}

function togglePlayPause() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

playPauseButton.addEventListener('click', togglePlayPause);
resetButton.addEventListener('click', resetTimer);
saveButton.addEventListener('click', saveTime);

window.addEventListener('load', () => {
    const savedTimes = JSON.parse(localStorage.getItem('savedTimes')) || [];
    savedTimes.forEach(timeString => {
        const li = document.createElement('li');
        li.textContent = timeString;
        savedTimesList.appendChild(li);
    });
    updateDisplay();
});

if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('Les notifications ne sont pas autorisées.');
        }
    });
}