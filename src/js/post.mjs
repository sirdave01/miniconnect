// To handle creating and viewing posts

import { addNotification } from './notification.mjs'; // Added for post creation notification
import { renderPostCard } from './feed.mjs'; // Added for rendering new post details
import { addComment, loadComments } from './comment.mjs'; // Added for loading comments in post details
import { loadFeed } from './feed.mjs'; // Added for back button

export async function createPost(app) {
    const text = app.postText.value.trim();
    if (!text) return;
    // Assume imageUrl and attachLocation from form (add inputs in HTML if needed)
    const imageUrl = ''; // Placeholder
    const geo = app.userLocation;
    const title = text.slice(0, 50) + (text.length > 50 ? '...' : '');
    const body = text;
    try {
        const newPost = await fetch(`${app.BASE_URL}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body, userId: app.currentUserId })
        }).then(res => res.json());
        newPost.imageUrl = imageUrl;
        newPost.geo = geo;
        app.posts.unshift(newPost);
        app.likes[newPost.id] = 0;
        app.comments[newPost.id] = [];
        addNotification(app, 'Your new post was created!');
        app.postText.value = '';
        app.showView('feed');
        loadFeed(app); // Only re-render feed, do not manually prepend
    } catch (err) {
        console.error('Create post error:', err);
    }
}

// displayNewPost removed: now handled by loadFeed/app.posts

export function loadPostDetails(app, postId) {
    app.showView('post-detail');
    const detailContainer = document.getElementById('post-detail-container');
    if (!detailContainer) return;

    detailContainer.innerHTML = '<button class="back-btn">← Back to Feed</button>';

    const post = app.posts.find(p => p.id === postId);
    if (!post) return;

    const detailCard = renderPostCard(app, post, true);
    detailContainer.appendChild(detailCard);

    // Comments section
    const commentsDiv = document.createElement('div');
    commentsDiv.id = `comments-${postId}`;
    commentsDiv.className = 'comments-section';
    loadComments(app, postId, commentsDiv);
    detailContainer.appendChild(commentsDiv);

    // ←←←←←←←←←←  NEW INLINE COMMENT FORM  ←←←←←←←←←←
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
            addComment(app, postId, body, textarea);   // pass textarea so it clears
        }
    });

    detailContainer.appendChild(commentForm);

    // Add back button functionality
    detailContainer.querySelector('.back-btn').addEventListener('click', () => {
        app.showView('feed');
        loadFeed(app);  // Refresh the feed to show updates
    });
}