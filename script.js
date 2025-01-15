let timer;
let isRunning = false;
let elapsedTime = 0;

const display = document.querySelector('.timer');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const resetButton = document.querySelector('#reset');
const saveButton = document.querySelector('#save');
const savedTimesList = document.querySelector('.saved-times ul');

function updateDisplay() {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timer = setInterval(() => {
            elapsedTime++;
            updateDisplay();
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timer);
    }
}

function resetTimer() {
    isRunning = false;
    clearInterval(timer);
    elapsedTime = 0;
    updateDisplay();
}

function saveTime() {
    const listItem = document.createElement('li');
    listItem.textContent = display.textContent;
    savedTimesList.appendChild(listItem);
}

startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
saveButton.addEventListener('click', saveTime);

updateDisplay();
