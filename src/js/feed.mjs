import { getPosts } from './api.mjs';

export async function loadFeed() {
    const feed = document.getElementById('feed');
    feed.innerHTML = '<p>Loading...</p>';

    try {
        const posts = await getPosts();
        feed.innerHTML = '';
        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
        <h3>User ${post.userId}</h3>
        <p>${post.title}</p>
        <p>${post.body}</p>
        <button class="like-btn" data-id="${post.id}">Like (0)</button>
      `;
            feed.appendChild(card);
        });
    } catch (err) {
        feed.innerHTML = '<p>Error loading feed</p>';
    }
}