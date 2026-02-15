// To handle storage for follows, notifications, etc

export function getFromStorage(key, defaultValue = []) {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));
}

export function setToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}