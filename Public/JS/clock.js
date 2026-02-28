// Clock and Timer JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize clock
    updateClock();
    setInterval(updateClock, 1000);

    // Initialize timezone selector
    const timezoneSelect = document.getElementById('timezone-select');
    timezoneSelect.addEventListener('change', updateClock);

    // Timer functionality
    const startTimerBtn = document.getElementById('start-timer');
    const pauseTimerBtn = document.getElementById('pause-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const timerDisplay = document.getElementById('timer-display');

    let timerInterval;
    let timerSeconds = 0;
    let timerRunning = false;

    startTimerBtn.addEventListener('click', startTimer);
    pauseTimerBtn.addEventListener('click', pauseTimer);
    resetTimerBtn.addEventListener('click', resetTimer);

    // Stopwatch functionality
    const startStopwatchBtn = document.getElementById('start-stopwatch');
    const pauseStopwatchBtn = document.getElementById('pause-stopwatch');
    const resetStopwatchBtn = document.getElementById('reset-stopwatch');
    const lapStopwatchBtn = document.getElementById('lap-stopwatch');
    const stopwatchDisplay = document.getElementById('stopwatch-display');
    const lapsContainer = document.getElementById('laps-container');

    let stopwatchInterval;
    let stopwatchTime = 0;
    let stopwatchRunning = false;
    let lapCount = 0;

    startStopwatchBtn.addEventListener('click', startStopwatch);
    pauseStopwatchBtn.addEventListener('click', pauseStopwatch);
    resetStopwatchBtn.addEventListener('click', resetStopwatch);
    lapStopwatchBtn.addEventListener('click', recordLap);

    function updateClock() {
        const timezone = timezoneSelect.value;
        fetch(`/api/clock/api/time${timezone !== 'UTC' ? '/' + timezone : ''}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const now = new Date(data.timestamp);
                    document.getElementById('digital-clock').textContent = now.toLocaleTimeString();
                    document.getElementById('date-display').textContent = now.toLocaleDateString();
                }
            })
            .catch(error => console.error('Error fetching time:', error));
    }

    function startTimer() {
        const hours = parseInt(document.getElementById('timer-hours').value) || 0;
        const minutes = parseInt(document.getElementById('timer-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('timer-seconds').value) || 0;

        timerSeconds = hours * 3600 + minutes * 60 + seconds;

        if (timerSeconds > 0) {
            timerRunning = true;
            startTimerBtn.disabled = true;
            pauseTimerBtn.disabled = false;
            resetTimerBtn.disabled = false;

            timerInterval = setInterval(() => {
                timerSeconds--;
                updateTimerDisplay();

                if (timerSeconds <= 0) {
                    clearInterval(timerInterval);
                    alert('Timer finished!');
                    resetTimer();
                }
            }, 1000);
        }
    }

    function pauseTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
    }

    function resetTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        timerSeconds = 0;
        updateTimerDisplay();
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;
        resetTimerBtn.disabled = true;
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;
        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startStopwatch() {
        stopwatchRunning = true;
        startStopwatchBtn.disabled = true;
        pauseStopwatchBtn.disabled = false;
        resetStopwatchBtn.disabled = false;
        lapStopwatchBtn.disabled = false;

        stopwatchInterval = setInterval(() => {
            stopwatchTime += 10; // Increment by 10ms
            updateStopwatchDisplay();
        }, 10);
    }

    function pauseStopwatch() {
        stopwatchRunning = false;
        clearInterval(stopwatchInterval);
        startStopwatchBtn.disabled = false;
        pauseStopwatchBtn.disabled = true;
        lapStopwatchBtn.disabled = true;
    }

    function resetStopwatch() {
        stopwatchRunning = false;
        clearInterval(stopwatchInterval);
        stopwatchTime = 0;
        lapCount = 0;
        updateStopwatchDisplay();
        lapsContainer.innerHTML = '';
        startStopwatchBtn.disabled = false;
        pauseStopwatchBtn.disabled = true;
        resetStopwatchBtn.disabled = true;
        lapStopwatchBtn.disabled = true;
    }

    function recordLap() {
        if (stopwatchRunning) {
            lapCount++;
            const lapTime = formatStopwatchTime(stopwatchTime);
            const lapElement = document.createElement('div');
            lapElement.className = 'text-center mb-2';
            lapElement.innerHTML = `<small class="text-muted">Lap ${lapCount}: ${lapTime}</small>`;
            lapsContainer.appendChild(lapElement);
        }
    }

    function updateStopwatchDisplay() {
        stopwatchDisplay.textContent = formatStopwatchTime(stopwatchTime);
    }

    function formatStopwatchTime(time) {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 10);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }
});
