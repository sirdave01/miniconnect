// To handle loading and rendering feed

import { handleLike } from './likes.mjs';
import { loadPostDetails } from './post.mjs'; // Added for click handler

export function loadFeed(app, additionalPosts = null) {
    if (!additionalPosts) {
        if (app.feedElement) app.feedElement.innerHTML = "";
    }
    // to move the newpost container to the top of the feed
    const newPosts = document.querySelector('#new-post-container');
    if (newPosts) {
        newPosts.classList.remove('hidden');
        app.feedElement.prepend(newPosts);
    }
    let postsToRender = additionalPosts || (app.showFollowedOnly ?
        app.posts.filter(p => app.followedUsers.has(p.userId)) : app.posts);
    postsToRender.forEach(post => {
        const card = renderPostCard(app, post);
        if (app.feedElement) app.feedElement.appendChild(card);
    });
}

export function renderPostCard(app, post, isDetail = false) {
    const user = app.users.find(u => u.id === post.userId);
    const card = document.createElement('div');
    card.className = 'post-card';
    card.dataset.postId = post.id;
    card.innerHTML = `
        <h3>${user ? user.name : 'User ' + post.userId}</h3>
        <p>${post.title}</p>
        ${isDetail ? `<p>${post.body}</p>` : ''}
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="post image">` : ''}
        ${post.geo ? `<span class="location-badge">Location: ${post.geo.lat}, ${post.geo.lng}</span>` : ''}
        <button class="like-btn ${app.myLikes.has(post.id) ? 'liked' : ''}" data-post-id="${post.id}">❤️ (${app.likes[post.id] || 0})</button>
    `;
    if (!isDetail) {
        card.addEventListener('click', () => loadPostDetails(app, post.id));
    }
    card.querySelector('.like-btn').addEventListener('click', (e) => handleLike(app, e));

    // Add comment display and form below each post in feed view
    if (!isDetail) {
        // Comment display area
        const commentsDiv = document.createElement('div');
        commentsDiv.id = `comments-${post.id}`;
        commentsDiv.className = 'comments-section';
        // Render existing comments if any
        if (app.comments[post.id] && app.comments[post.id].length > 0) {
            commentsDiv.innerHTML = app.comments[post.id]
                .map(c => `<div class="comment"><strong>${c.name || 'You'}:</strong> ${c.body}</div>`)
                .join('');
        }
        card.appendChild(commentsDiv);

        // Comment form
        const commentForm = document.createElement('form');
        commentForm.className = 'comment-form';
        commentForm.innerHTML = `
            <textarea placeholder="Write a comment..." maxlength="280" rows="2"></textarea>
            <button type="submit" class="comment-button">Comment</button>
        `;
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const textarea = commentForm.querySelector('textarea');
            const body = textarea.value.trim();
            if (body) {
                import('./comment.mjs').then(({ addComment }) => {
                    addComment(app, post.id, body, textarea).then(() => {
                        // Immediately update the commentsDiv with the new comment
                        if (!app.comments[post.id]) app.comments[post.id] = [];
                        commentsDiv.innerHTML = app.comments[post.id]
                            .map(c => `<div class="comment"><strong>${c.name || 'You'}:</strong> ${c.body}</div>`)
                            .join('');
                    });
                });
            }
        });
        card.appendChild(commentForm);
    }
    return card;
}