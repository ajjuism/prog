chrome.storage.local.get(['taskName', 'timeType', 'startTime', 'deadline'], function(data) {
    if (data.taskName && data.timeType && data.startTime && data.deadline) {
        const currentTime = new Date().getTime();
        const remainingTime = getTimeDifference(data.deadline, currentTime, data.timeType);

        if (remainingTime <= 0) {
            showDeadlineNotification();
        }
    }
});

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

function showDeadlineNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Task Progress Tracker',
        message: 'Your deadline has been reached!'
    });
}

// Set an alarm to check the deadline every minute
chrome.alarms.create('checkDeadline', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'deadlineAlarm') {
        showDeadlineNotification();
    }
});

function showDeadlineNotification() {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon48.png',
        title: 'Task Progress Tracker',
        message: 'Your deadline has been reached!'
    });
}
