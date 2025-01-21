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
const clearHistoryCrossButton = document.querySelector('#clear-history-cross');
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
    const sound = selectedSound === 'sound1' ? sound1 : sound2;
    sound.currentTime = 0;
    sound.play().catch(error => console.error('Erreur lors de la lecture du son:', error));
}

function checkNotification() {
    const totalMilliseconds = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
    if (notificationTime !== null && totalMilliseconds >= notificationTime * 1000) {
        playSound();
        if (Notification.permission === 'granted') {
            new Notification(notificationMessage, {
                body: `Temps écoulé: ${notificationTime} secondes`,
                icon: 'notification-icon.png' // Assurez-vous d'avoir une icône de notification
            });
        } else {
            alert(notificationMessage);
        }
        notificationTime = null;
         const savedTimesHeader = document.querySelector('.saved-times-header');
        savedTimesHeader.classList.add('show');
        clearHistoryButton.style.display = 'inline-block';
    }
    // Ajouter la vérification pour les notifications en arrière-plan
    if (document.hidden && Notification.permission === 'granted') {
        new Notification('TimeSnap', {
            body: 'L\'alarme a sonné!',
            icon: 'notification-icon.png' // Assurez-vous d'avoir une icône de notification
        });
    }
}

function updateNotificationReminder() {
    const notificationReminder = document.getElementById('notification-reminder');
    const notificationTimeRemaining = document.getElementById('notification-time-remaining');
    const notificationTitle = document.getElementById('notification-title');

    if (notificationTime !== null) {
        const totalMilliseconds = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime;
        const remainingTime = notificationTime * 1000 - totalMilliseconds;
        if (remainingTime > 0) {
            const hours = Math.floor(remainingTime / 3600000);
            const minutes = Math.floor((remainingTime % 3600000) / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            notificationTimeRemaining.textContent = `Temps restant: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            notificationTitle.textContent = `Titre: ${notificationMessage}`;
            notificationReminder.classList.add('show');
        } else {
            notificationReminder.classList.remove('show');
        }
    } else {
        notificationReminder.classList.remove('show');
    }
}

function updatePlayPauseIcon() {
    const icon = playPauseButton.querySelector('.icon');
    if (isRunning) {
        icon.classList.replace('fa-play', 'fa-pause');
        playPauseButton.textContent = ' Pause';
    } else {
        icon.classList.replace('fa-pause', 'fa-play');
        playPauseButton.textContent = ' Démarrer';
    }
    playPauseButton.prepend(icon);
}

function applyPauseStyles() {
    document.body.classList.add('paused');
}

function removePauseStyles() {
    document.body.classList.remove('paused');
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now();
        timer = setInterval(() => {
            updateDisplay();
            checkNotification();
            updateNotificationReminder();
        }, 10);
        updatePlayPauseIcon();
        removePauseStyles();
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        elapsedTime += Date.now() - startTime;
        clearInterval(timer);
        updatePlayPauseIcon();
        applyPauseStyles();
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    elapsedTime = 0;
    startTime = 0;
    updateDisplay();
    updatePlayPauseIcon();
    removePauseStyles();
    document.body.classList.remove('paused');
}

function updateClearHistoryButton() {
    const savedTimes = JSON.parse(localStorage.getItem('savedTimes')) || [];
    clearHistoryButton.style.display = savedTimes.length > 0 ? 'inline-block' : 'none';
    clearHistoryCrossButton.style.display = savedTimes.length > 0 ? 'inline-block' : 'none';
    const savedTimesHeader = document.querySelector('.saved-times-header');
    if (savedTimes.length > 0) {
        savedTimesHeader.classList.add('show');
    } else {
        savedTimesHeader.classList.remove('show');
    }
}

function saveTime() {
    const totalMilliseconds = isRunning ? Date.now() - startTime + elapsedTime : elapsedTime; // Utiliser le temps total écoulé
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

    const scrollableParent = savedTimesList.parentElement;
    const isScrolledToBottom = scrollableParent.scrollHeight - scrollableParent.scrollTop <= scrollableParent.clientHeight + 1;
    
    li.classList.add('show');

    if (isScrolledToBottom && savedTimesList.scrollHeight > savedTimesList.clientHeight) { // Éviter le défilement dès le premier enregistrement
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
    isRunning ? pauseTimer() : startTimer();
}

playPauseButton.addEventListener('click', togglePlayPause);
resetButton.addEventListener('click', resetTimer);
saveButton.addEventListener('click', saveTime);
clearHistoryButton.addEventListener('click', clearHistory);
clearHistoryCrossButton.addEventListener('click', clearHistory);

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
    notificationTime = timeUnit === 'minutes' ? timeValue * 60 : timeUnit === 'hours' ? timeValue * 3600 : timeValue;
    notificationMessage = notificationMessageInput.value;

    const confirmationMessage = document.querySelector('.confirmation-message');
    confirmationMessage.textContent = 'Notification définie avec succès !';
    confirmationMessage.classList.add('show');
    setTimeout(() => {
        confirmationMessage.classList.remove('show');
    }, 3000);

    popup.classList.remove('active');
    popupOverlay.classList.remove('active');

    updateNotificationReminder();

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
                alert('Les notifications ne sont pas autorisées.');
            }
        });
    }
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
    darkModeIcon.classList.replace(document.body.classList.contains('dark-mode') ? 'fa-moon' : 'fa-sun', document.body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon');
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
    updatePlayPauseIcon();

    document.body.classList.add('dark-mode');
    darkModeIcon.classList.replace('fa-moon', 'fa-sun');

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const permissionPopup = document.querySelector('.notification-permission-popup');
        const permissionOverlay = document.querySelector('.notification-permission-overlay');
        permissionPopup.classList.add('active');
        permissionOverlay.classList.add('active');

        document.getElementById('allow-notifications').addEventListener('click', () => {
            Notification.requestPermission().then(permission => {
                if (permission !== 'granted') {
                    alert('Les notifications ne sont pas autorisées.');
                }
                permissionPopup.classList.remove('active');
                permissionOverlay.classList.remove('active');
            });
        });

        document.getElementById('deny-notifications').addEventListener('click', () => {
            permissionPopup.classList.remove('active');
            permissionOverlay.classList.remove('active');
        });
    }

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
                alert('Les notifications ne sont pas autorisées.');
            }
        });
    }
});

if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
            alert('Les notifications ne sont pas autorisées.');
        }
    });
}