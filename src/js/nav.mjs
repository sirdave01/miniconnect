// Handles navigation


import { loadFeed } from './feed.mjs'; // Added for home view
import { loadNearby } from './locationdiscovery.mjs'; // Added for nearby view
import { renderPostCard } from './feed.mjs'; // Added for profile posts
import { loadSettings } from './settings.mjs';
import { renderNotifications } from './notification.mjs';

export function initNavigation(app) {
    app.navList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const view = e.target.dataset.view;
            app.showView(view);
            if (view === 'home') loadFeed(app);
            else if (view === 'nearby') loadNearby(app);
            else if (view === 'profile') loadProfile(app, app.currentUserId);
            else if (view === 'settings') loadSettings(app);
            else if (view === 'notifications') renderNotifications(app);
        }
    });
}

export function loadProfile(app, userId) {
    if (app.profileInfoElement) app.profileInfoElement.innerHTML = '';
    if (app.profilePostsElement) app.profilePostsElement.innerHTML = '';
    userId = userId || app.currentUserId;
    const user = app.users.find(u => u.id === userId);
    if (user && app.profileInfoElement) {
        app.profileInfoElement.innerHTML = `
            <h2>${user.name}</h2>
            <p>@${user.username}</p>
            <button class="follow-button" data-user-id="${userId}">${app.followedUsers.has(userId) ? 'Unfollow' : 'Follow'}</button>
        `;
        const userPosts = app.posts.filter(p => p.userId === userId);
        userPosts.forEach(p => {
            if (app.profilePostsElement) app.profilePostsElement.appendChild(renderPostCard(app, p));
        });
    }
}