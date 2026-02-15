
// Helper to show error to user
function showLocationError(message, locationDiv) {
    if (locationDiv) {
        locationDiv.textContent = message;
        locationDiv.style.color = 'red';
    } else {
        let el = document.getElementById('location-error');
        if (!el) {
            el = document.createElement('div');
            el.id = 'location-error';
            el.style.color = 'red';
            el.style.margin = '1em';
            document.body.prepend(el);
        }
        el.textContent = message;
    }
}

async function getUserLocation() {
    if (navigator.geolocation) {
        try {
            return await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    pos => {
                        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    },
                    async () => {
                        // Fallback to IP-based geolocation only if denied or failed
                        try {
                            const loc = await getLocationByIP();
                            resolve(loc);
                        } catch (ipErr) {
                            reject(ipErr);
                        }
                    }
                );
            });
        } catch {
            return await getLocationByIP();
        }
    } else {
        return await getLocationByIP();
    }
}

async function getLocationByIP() {
    // Using ipinfo.io (no API key needed for basic usage, limited to 50k/month)
    const response = await fetch('https://ipinfo.io/json?token='); // Optionally add a token if you have one
    if (!response.ok) throw new Error('IP location lookup failed');
    const data = await response.json();
    if (!data.loc) throw new Error('IP location lookup failed');
    const [lat, lng] = data.loc.split(',').map(Number);
    return { lat, lng };
}

async function getWeather(lat, lng) {
    // Example: Open-Meteo free API (no key required)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather fetch failed');
    const data = await response.json();
    return data.current_weather;
}

// Main function to update UI
export async function getGeolocation(locationDiv, weatherDiv) {
    locationDiv.textContent = 'Getting your location...';
    try {
        const loc = await getUserLocation();
        locationDiv.textContent = `Your location: Lat ${loc.lat.toFixed(4)}, Lng ${loc.lng.toFixed(4)}`;
        try {
            const weather = await getWeather(loc.lat, loc.lng);
            weatherDiv.classList.remove('hidden');
            weatherDiv.textContent = `Weather: ${weather.temperature}°C, Wind ${weather.windspeed} km/h`;
        } catch (wErr) {
            weatherDiv.classList.add('hidden');
            weatherDiv.textContent = '';
        }
    } catch (err) {
        showLocationError('Unable to determine your location.', locationDiv);
        weatherDiv.classList.add('hidden');
        weatherDiv.textContent = '';
    }
}