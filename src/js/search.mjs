// Handles search

import { renderPostCard } from './feed.mjs'; // Added for rendering post results
import { loadProfile } from './nav.mjs'; // Added for user profile navigation

export function performSearch(app, query) {
    const results = document.getElementById('search-results');
    if (results) results.innerHTML = '';
    query = query.toLowerCase();
    // Users
    const matchedUsers = app.users.filter(u => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query));
    matchedUsers.forEach(u => {
        const div = document.createElement('div');
        div.textContent = `${u.name} (@${u.username})`;
        div.addEventListener('click', () => loadProfile(app, u.id));
        if (results) results.appendChild(div);
    });
    // Posts
    const matchedPosts = app.posts.filter(p => p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query));
    matchedPosts.forEach(p => {
        if (results) results.appendChild(renderPostCard(app, p));
    });
}