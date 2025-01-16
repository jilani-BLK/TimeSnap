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

const notificationButton = document.querySelector('#notification-button');
const popup = document.querySelector('.popup');
const popupOverlay = document.querySelector('.popup-overlay');

const notificationForm = document.querySelector('.notification-form');
const notificationTimeInput = document.querySelector('#notification-time');
const notificationMessageInput = document.querySelector('#notification-message');
const timeUnitSelect = document.querySelector('#time-unit-select');
let notificationTime = null;
let notificationMessage = '';

const clearHistoryButton = document.querySelector('#clear-history');
const fullscreenButton = document.querySelector('#fullscreen-button');
const toggleDarkModeButton = document.querySelector('#toggle-dark-mode');
const darkModeIcon = document.querySelector('#dark-mode-icon');

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

function playSound() {
    const selectedSound = soundSelect.value;
    if (selectedSound === 'sound1') {
        sound1.currentTime = 0; // Réinitialiser le son
        sound1.play().then(() => console.log('Playing sound 1')).catch(error => console.error('Erreur lors de la lecture du son:', error));
    } else if (selectedSound === 'sound2') {
        sound2.currentTime = 0; // Réinitialiser le son
        sound2.play().then(() => console.log('Playing sound 2')).catch(error => console.error('Erreur lors de la lecture du son:', error));
    }
}

function checkNotification() {
    const totalMilliseconds = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
    if (notificationTime !== null && totalMilliseconds >= notificationTime * 1000) {
        playSound();
        if (Notification.permission === 'granted') {
            new Notification(notificationMessage);
        } else {
            alert(notificationMessage);
        }
        notificationTime = null; // Reset notification
    }
}

function updatePlayPauseIcon() {
    const icon = playPauseButton.querySelector('.icon');
    if (isRunning) {
        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Icône de pause
        playPauseButton.textContent = ' Pause';
        playPauseButton.prepend(icon);
    } else {
        icon.innerHTML = '<path d="M8 5v14l11-7z"/>'; // Icône de démarrage
        playPauseButton.textContent = ' Démarrer';
        playPauseButton.prepend(icon);
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now();
        timer = setInterval(() => {
            updateDisplay();
            checkNotification();
        }, 10);
        updatePlayPauseIcon();
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        elapsedTime += Date.now() - startTime;
        clearInterval(timer);
        updatePlayPauseIcon();
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = 0;
    startTime = 0;
    updateDisplay();
    updatePlayPauseIcon(); // Mettre à jour l'icône lors de la réinitialisation
}

function updateClearHistoryButton() {
    const savedTimes = JSON.parse(localStorage.getItem('savedTimes')) || [];
    if (savedTimes.length > 0) {
        clearHistoryButton.style.display = 'inline-block';
    } else {
        clearHistoryButton.style.display = 'none';
    }
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

    updateClearHistoryButton();

    // Ajustement : Garde la vue actuelle stable tout en assurant un défilement fluide
    const scrollableParent = savedTimesList.parentElement;
    const isScrolledToBottom = scrollableParent.scrollHeight - scrollableParent.scrollTop <= scrollableParent.clientHeight + 1;
    
    if (isScrolledToBottom) {
        // Défilement uniquement si l'utilisateur est en bas de la liste
        setTimeout(() => {
            li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function clearHistory() {
    savedTimesList.innerHTML = '';
    localStorage.removeItem('savedTimes');
    updateClearHistoryButton();
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
clearHistoryButton.addEventListener('click', clearHistory);

notificationButton.addEventListener('click', () => {
    popup.classList.add('active');
    popupOverlay.classList.add('active');
});

popupOverlay.addEventListener('click', () => {
    popup.classList.remove('active');
    popupOverlay.classList.remove('active');
});

notificationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const timeValue = parseInt(notificationTimeInput.value, 10);
    const timeUnit = timeUnitSelect.value;
    if (timeUnit === 'minutes') {
        notificationTime = timeValue * 60;
    } else if (timeUnit === 'hours') {
        notificationTime = timeValue * 3600;
    } else {
        notificationTime = timeValue;
    }
    notificationMessage = notificationMessageInput.value;

    // Afficher le message de confirmation avec animation
    const confirmationMessage = document.querySelector('.confirmation-message');
    confirmationMessage.textContent = 'Notification définie avec succès !';
    confirmationMessage.classList.add('show');
    setTimeout(() => {
        confirmationMessage.classList.remove('show');
    }, 3000);

    popup.classList.remove('active');
    popupOverlay.classList.remove('active');
});

fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Erreur lors de la tentative de mise en plein écran: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

toggleDarkModeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        darkModeIcon.innerHTML = '<path d="M12 2a9.93 9.93 0 0 0-7.07 2.93A9.93 9.93 0 0 0 2 12c0 2.76 1.12 5.26 2.93 7.07A9.93 9.93 0 0 0 12 22c2.76 0 5.26-1.12 7.07-2.93A9.93 9.93 0 0 0 22 12c0-2.76-1.12-5.26-2.93-7.07A9.93 9.93 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>'; // Icône de lune
        toggleDarkModeButton.textContent = ' Mode Clair';
        toggleDarkModeButton.prepend(darkModeIcon);
    } else {
        darkModeIcon.innerHTML = '<path d="M6.76 4.84l-1.8-1.79-1.42 1.41 1.79 1.8-1.79 1.8 1.42 1.41 1.8-1.79 1.8 1.79 1.41-1.41-1.79-1.8 1.79-1.8-1.41-1.41-1.8 1.79zm10.48 0l1.8-1.79 1.42 1.41-1.79 1.8 1.79 1.8-1.42 1.41-1.8-1.79-1.8 1.79-1.41-1.41 1.79-1.8-1.79-1.8 1.41-1.41 1.8 1.79zM12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>'; // Icône de soleil
        toggleDarkModeButton.textContent = ' Mode Sombre';
        toggleDarkModeButton.prepend(darkModeIcon);
    }
});

window.addEventListener('load', () => {
    const savedTimes = JSON.parse(localStorage.getItem('savedTimes')) || [];
    savedTimes.forEach(timeString => {
        const li = document.createElement('li');
        li.textContent = timeString;
        savedTimesList.appendChild(li);
    });
    updateDisplay();
    updateClearHistoryButton();
    updatePlayPauseIcon(); // Mettre à jour l'icône au chargement
});

if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('Les notifications ne sont pas autorisées.');
        }
    });
}