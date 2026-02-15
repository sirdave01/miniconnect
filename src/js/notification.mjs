// Handles notifications

import { setToStorage } from './localstorage.mjs';

export function addNotification(app, message) {
    app.notifications.push({ message, read: false, timestamp: Date.now() });
    setToStorage('notifications', app.notifications);
    updateNotificationCount(app);
}

export function updateNotificationCount(app) {
    const unread = app.notifications.filter(n => !n.read).length;
    if (app.notifCountElement) app.notifCountElement.textContent = unread;
}

export function renderNotifications(app) {
    // Create dropdown if not exist
    const dropdown = document.getElementById('notifications-dropdown') || document.createElement('div');
    dropdown.id = 'notifications-dropdown';
    dropdown.style.display = 'block';
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear All';
    clearButton.addEventListener('click', () => clearNotifications(app, dropdown));
    const markReadButton = document.createElement('button');
    markReadButton.textContent = 'Mark All as Read';
    markReadButton.addEventListener('click', () => markAllAsRead(app, dropdown));
    dropdown.appendChild(markReadButton);
    dropdown.appendChild(clearButton);
    app.notifications.sort((a, b) => b.timestamp - a.timestamp).forEach(n => {
        const item = document.createElement('div');
        item.textContent = n.message;
        if (!n.read) item.classList.add('unread');
        dropdown.appendChild(item);
    });
    if (app.notificationsBell) app.notificationsBell.appendChild(dropdown); // Append temporarily
    // Hide on click outside (add global listener if needed)
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !app.notificationsBell.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }, { once: true });
}

function markAllAsRead(app, dropdown) {
    app.notifications.forEach(n => n.read = true);
    setToStorage('notifications', app.notifications);
    updateNotificationCount(app);
    dropdown.innerHTML = ''; // Re-render or hide
    renderNotifications(app); // Refresh
}

function clearNotifications(app, dropdown) {
    app.notifications = [];
    setToStorage('notifications', app.notifications);
    updateNotificationCount(app);
    dropdown.innerHTML = '<p>No notifications</p>';
}