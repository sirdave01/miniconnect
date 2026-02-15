// Handles nearby feed

import { renderPostCard } from './feed.mjs';

export function loadNearby(app) {
    app.showView('nearby');
    if (!app.userLocation) {
        if (app.nearbyFeedElement) app.nearbyFeedElement.innerHTML = '<p>No location.</p>';
        return;
    }
    const geoPosts = app.posts.filter(p => p.geo);
    if (!geoPosts.length) {
        if (app.nearbyFeedElement) app.nearbyFeedElement.innerHTML = '<p>No nearby posts.</p>';
        return;
    }
    const sorted = geoPosts.map(p => ({
        post: p,
        dist: calculateDistance(app.userLocation.lat, app.userLocation.lng, p.geo.lat, p.geo.lng)
    })).sort((a, b) => a.dist - b.dist);
    sorted.forEach(({ post, dist }) => {
        const card = renderPostCard(app, post);
        card.innerHTML += ` (${Math.round(dist)} km)`;
        if (app.nearbyFeedElement) app.nearbyFeedElement.appendChild(card);
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}