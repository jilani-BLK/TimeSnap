let timer;
let isRunning = false;
let elapsedTime = 0;

const display = document.querySelector('.timer');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const resetButton = document.querySelector('#reset');
const saveButton = document.querySelector('#save');
const savedTimesList = document.querySelector('.saved-times ul');
const soundSelect = document.querySelector('#sound-select');
const sound1 = new Audio('notification1.mp3');
const sound2 = new Audio('notification2.mp3');

sound1.addEventListener('canplaythrough', () => console.log('Sound 1 loaded'));
sound2.addEventListener('canplaythrough', () => console.log('Sound 2 loaded'));

sound1.volume = 1.0;
sound2.volume = 1.0;

const notificationForm = document.querySelector('.notification-form');
const notificationTimeInput = document.querySelector('#notification-time');
const notificationMessageInput = document.querySelector('#notification-message');
let notificationTime = null;
let notificationMessage = '';

notificationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    notificationTime = parseInt(notificationTimeInput.value, 10);
    notificationMessage = notificationMessageInput.value;
    alert('Notification définie!');
});

function updateDisplay() {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function playSound() {
    const selectedSound = soundSelect.value;
    if (selectedSound === 'sound1') {
        sound1.play().then(() => console.log('Playing sound 1')).catch(error => console.error('Erreur lors de la lecture du son:', error));
    } else if (selectedSound === 'sound2') {
        sound2.play().then(() => console.log('Playing sound 2')).catch(error => console.error('Erreur lors de la lecture du son:', error));
    }
}

function checkNotification() {
    if (notificationTime !== null && elapsedTime >= notificationTime) {
        playSound();
        if (Notification.permission === 'granted') {
            new Notification(notificationMessage);
        } else {
            alert(notificationMessage);
        }
        notificationTime = null; // Reset notification
    }
}

if (window.Worker) {
    const timerWorkerBlob = new Blob([`
        let elapsedTime = 0;
        let timer;

        self.onmessage = function(e) {
            if (e.data === 'start') {
                timer = setInterval(() => {
                    elapsedTime++;
                    postMessage(elapsedTime);
                }, 1000);
            } else if (e.data === 'pause') {
                clearInterval(timer);
            } else if (e.data === 'reset') {
                clearInterval(timer);
                elapsedTime = 0;
                postMessage(elapsedTime);
            }
        };
    `], { type: 'application/javascript' });

    const timerWorker = new Worker(URL.createObjectURL(timerWorkerBlob));

    timerWorker.onmessage = function(e) {
        elapsedTime = e.data;
        updateDisplay();
        checkNotification();
    };

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timerWorker.postMessage('start');
        }
    }

    function pauseTimer() {
        if (isRunning) {
            isRunning = false;
            timerWorker.postMessage('pause');
        }
    }

    function resetTimer() {
        isRunning = false;
        timerWorker.postMessage('reset');
        elapsedTime = 0;
        updateDisplay();
    }

    startButton.addEventListener('click', startTimer);
    pauseButton.addEventListener('click', pauseTimer);
    resetButton.addEventListener('click', resetTimer);
    saveButton.addEventListener('click', saveTime);

    updateDisplay();
} else {
    console.error('Web Workers are not supported in this browser.');
}

if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('Les notifications ne sont pas autorisées.');
        }
    });
}
