// Request notification permission when popup is opened
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

let interval;

// Event listeners
document.getElementById('saveBtn').addEventListener('click', saveTaskDetails);
document.getElementById('progressTab').addEventListener('click', showProgressTab);
document.getElementById('settingsTab').addEventListener('click', showSettingsTab);

// Save task details and update UI
function saveTaskDetails() {
    const taskName = document.getElementById('taskNameInput').value;
    const timeType = document.getElementById('timeType').value;
    const deadline = new Date(document.getElementById('deadlineInput').value).getTime();
    const startTime = new Date().getTime();

    // Set an alarm for the deadline
    chrome.alarms.create('deadlineAlarm', { when: deadline });

    // Save the task details to Chrome's local storage
    chrome.storage.local.set({ 'taskName': taskName, 'timeType': timeType, 'startTime': startTime, 'deadline': deadline });

    // Update the UI
    updateUI(taskName, timeType, startTime, deadline);

    // Start an interval to constantly update the elapsed and remaining time
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => {
        updateUI(taskName, timeType, startTime, deadline);
    }, 1000); // Update every second

    // Switch to the Progress tab after saving
    showProgressTab();

    const progressBarStyle = document.getElementById('progressBarStyle').value;
    chrome.storage.local.set({ 'progressBarStyle': progressBarStyle });
    setProgressBarStyle(progressBarStyle);
}

function showProgressTab() {
    document.getElementById('progressContent').classList.add('active');
    document.getElementById('settingsContent').classList.remove('active');
}

function showSettingsTab() {
    document.getElementById('settingsContent').classList.add('active');
    document.getElementById('progressContent').classList.remove('active');
}

function setProgressBarStyle(style) {
    const progressBar = document.getElementById('progressBar');
    progressBar.className = ''; // Reset classes

    if (style === 'striped') {
        progressBar.classList.add('striped-progress');
    } else if (style === 'rounded') {
        progressBar.classList.add('rounded-progress');
    }
}

function updateUI(taskName, timeType, startTime, deadline) {
    document.getElementById('taskTitle').innerText = taskName;

    const currentTime = new Date().getTime();
    const elapsedTime = getTimeDifference(currentTime, startTime, timeType);
    const remainingTime = getTimeDifference(deadline, currentTime, timeType);
    const totalDuration = getTimeDifference(deadline, startTime, timeType);
    const progress = (elapsedTime / totalDuration) * 100;

    // Stop the elapsed time and remaining time when the deadline is achieved
    if (currentTime >= deadline) {
        elapsedTime = totalDuration;
        remainingTime = 0;
        clearInterval(interval); // Stop the interval
        showDeadlineNotification(); // Show notification when deadline is reached
    }

    document.getElementById('progressBar').value = progress;
    document.getElementById('deadline').innerText = `Deadline: ${new Date(deadline).toLocaleString()}`;
    document.getElementById('timePassed').innerText = `Time Passed: ${elapsedTime} ${timeType}`;
    document.getElementById('timeRemaining').innerText = `Time Remaining: ${remainingTime} ${timeType}`;
}

function getTimeDifference(endTime, startTime, timeType) {
    const difference = endTime - startTime;
    switch (timeType) {
        case 'days':
            return Math.floor(difference / 86400000);
        case 'hours':
            return Math.floor(difference / 3600000);
        case 'minutes':
            return Math.floor(difference / 60000);
        case 'seconds':
            return Math.floor(difference / 1000);
        default:
            return 0;
    }
}

// Function to show the notification
function showDeadlineNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png', // Ensure you have an icon at this path
        title: 'Task Progress Tracker',
        message: 'Your deadline has been reached!'
    });
}

// Load the saved task details and progress bar style from Chrome's local storage when the popup is opened
chrome.storage.local.get(['taskName', 'timeType', 'startTime', 'deadline', 'progressBarStyle'], function(data) {
    if (data.taskName && data.timeType && data.startTime && data.deadline) {
        updateUI(data.taskName, data.timeType, data.startTime, data.deadline);

        // Start an interval to constantly update the elapsed and remaining time
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(() => {
            updateUI(data.taskName, data.timeType, data.startTime, data.deadline);
        }, 1000); // Update every second
    }

    if (data.progressBarStyle) {
        setProgressBarStyle(data.progressBarStyle);
        document.getElementById('progressBarStyle').value = data.progressBarStyle; // Set the selected style in the dropdown
    }
});
