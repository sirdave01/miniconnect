// Main app class coordinating all modules


// import { getUserLocation } from './geolocation.mjs';
import { getFromStorage } from './localstorage.mjs';
import { handleLike } from './likes.mjs';
import { handleFollow } from './follow.mjs';
import { loadFeed } from './feed.mjs';
import { createPost, loadPostDetails } from './post.mjs';
import { loadComments } from './comment.mjs';
import { performSearch } from './search.mjs';
import { addNotification, renderNotifications } from './notification.mjs';
import { initNavigation } from './nav.mjs';
import { toggleTheme, loadTheme } from './theme.mjs';
import { loadNearby } from './locationdiscovery.mjs';
import { initFooterDate } from './footer.mjs';

export class MiniConnectApp {
    constructor() {
        this.BASE_URL = 'https://jsonplaceholder.typicode.com';
        this.posts = [];
        this.users = [];
        this.comments = {}; // postId: [comments]
        this.likes = {}; // postId: count
        this.myLikes = new Set();
        this.followedUsers = new Set(getFromStorage('followedUsers', []));
        this.notifications = getFromStorage('notifications', []);
        this.currentUserId = 1;
        this.userLocation = null;
        this.showFollowedOnly = false;
        this.currentPage = 1;
        this.pageSize = 10;
        this.hasMorePosts = true;
        this.feedElement = document.getElementById('posts-feed');
        this.nearbyFeedElement = document.getElementById('nearby-feed');
        this.profileInfoElement = document.getElementById('user-info');
        this.profilePostsElement = document.getElementById('user-posts');
        this.notifCountElement = document.getElementById('notif-count') || document.createElement('span'); // Fallback if missing
        this.loadMoreButton = document.getElementById('load-more');
        this.submitPostButton = document.getElementById('submit-post');
        this.postText = document.getElementById('post-text');
        this.navList = document.getElementById('nav-list') || document.getElementById('quick-links'); // Fallback to your HTML
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.notificationsBell = document.getElementById('notifications-bell');
        this.init();
    }

    async init() {
        try {
            this.users = await this.fetchData('/users');
            await this.loadInitialPosts();

            // --- Geolocation & Weather UI ---
            // Insert at top of feed
            if (this.feedElement) {
                // Remove old if any
                let oldLoc = this.feedElement.querySelector('.location');
                if (oldLoc) oldLoc.remove();
                let oldWeather = this.feedElement.querySelector('.weather');
                if (oldWeather) oldWeather.remove();

                this.locationDiv = document.createElement('div');
                this.locationDiv.classList.add('location');
                this.feedElement.prepend(this.locationDiv);

                this.weatherDiv = document.createElement('div');
                this.weatherDiv.classList.add('weather', 'hidden');
                this.feedElement.prepend(this.weatherDiv);
            }
            // Call geolocation logic
            if (this.locationDiv && this.weatherDiv) {
                const { getGeolocation } = await import('./geolocation.mjs');
                getGeolocation(this.locationDiv, this.weatherDiv);
            }

            loadTheme(this.darkModeToggle);
            initNavigation(this);
            this.initEventListeners();
            addNotification(this, 'Welcome to MiniConnect!');
            loadFeed(this);
            initFooterDate();
        } catch (err) {
            console.error('Init error:', err);
            if (this.feedElement) this.feedElement.innerHTML = '<p>Error loading app.</p>';
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(`${this.BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error('Fetch failed');
        return response.json();
    }

    async loadInitialPosts() {
        const initialPosts = await this.fetchData(`/posts?_page=${this.currentPage}&_limit=${this.pageSize}`);
        this.posts = [...this.posts, ...initialPosts];
        this.posts.sort((a, b) => b.id - a.id);
        this.posts.forEach(post => {
            this.likes[post.id] = 0;
            this.comments[post.id] = [];
        });
        this.hasMorePosts = initialPosts.length === this.pageSize;
    }

    async loadMorePosts() {
        if (!this.hasMorePosts) return;
        this.currentPage++;
        const morePosts = await this.fetchData(`/posts?_page=${this.currentPage}&_limit=${this.pageSize}`);
        this.posts = [...this.posts, ...morePosts];
        this.posts.sort((a, b) => b.id - a.id);
        morePosts.forEach(post => {
            if (!(post.id in this.likes)) this.likes[post.id] = 0;
            if (!(post.id in this.comments)) this.comments[post.id] = [];
        });
        this.hasMorePosts = morePosts.length === this.pageSize;
        loadFeed(this, morePosts); // Append new
    }

    initEventListeners() {
        if (this.loadMoreButton) this.loadMoreButton.addEventListener('click', this.loadMorePosts.bind(this));
        if (this.submitPostButton) this.submitPostButton.addEventListener('click', () => createPost(this));
        if (this.darkModeToggle) this.darkModeToggle.addEventListener('click', () => toggleTheme(this.darkModeToggle));
        if (this.notificationsBell) this.notificationsBell.addEventListener('click', () => renderNotifications(this));
        window.addEventListener('scroll', this.handleInfiniteScroll.bind(this));
        if (this.feedElement) {
            this.feedElement.addEventListener('click', event => {
                if (event.target.classList.contains('like-btn')) {
                    handleLike(this, event);
                } else if (event.target.classList.contains('follow-button')) {
                    handleFollow(this, event);
                } else if (event.target.classList.contains('view-comments-button')) {
                    const postId = parseInt(event.target.dataset.postId);
                    loadComments(this, postId);
                } else if (event.target.closest('.post-card')) {
                    const postId = parseInt(event.target.closest('.post-card').dataset.postId);
                    loadPostDetails(this, postId);
                }
            });
        }
        // Add search button listener if exists
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const query = document.getElementById('search-input').value.trim();
                if (query) performSearch(this, query);
            });
        }
        // Add nearby button if exists
        const nearbyButton = document.querySelector('.nearby-button');
        if (nearbyButton) nearbyButton.addEventListener('click', () => loadNearby(this));
    }

    handleInfiniteScroll() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && this.hasMorePosts) {
            this.loadMorePosts();
        }
    }

    showView(viewId) {
        document.querySelectorAll('main > div').forEach(div => div.classList.add('hidden'));
        const container = document.getElementById(`${viewId}-container`);
        if (container) container.classList.remove('hidden');
    }
}