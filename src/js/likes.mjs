// to handle likes and dislikes on posts and comments

import { addNotification } from './notification.mjs';

export function handleLike(app, event) {
    const button = event.target;
    const postId = parseInt(button.dataset.postId);
    const isLiked = app.myLikes.has(postId);

    app.likes[postId] = (app.likes[postId] || 0) + (isLiked ? -1 : 1);
    if (isLiked) {
        app.myLikes.delete(postId);
        button.classList.remove('liked');
    } else {
        app.myLikes.add(postId);
        button.classList.add('liked');

        const post = app.posts.find(p => p.id === postId);
        if (post.userId !== app.currentUserId) {
            addNotification(app, `User ${app.currentUserId} liked your post "${post.title}"`);
        }
    }
    button.innerHTML = `❤️ (${app.likes[postId]})`;
    // simulate patch
    fetch(`${app.BASE_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ likes: app.likes[postId] })
    }).catch(err => console.error('Error updating like:', err));
}