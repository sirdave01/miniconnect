// Handles comments

export async function loadComments(app, postId, container = document.getElementById(`comments-${postId}`)) { // Made container optional/fallback
    try {
        const apiComments = await fetch(`${app.BASE_URL}/posts/${postId}/comments`).then(res => res.json());
        app.comments[postId] = [...(app.comments[postId] || []), ...apiComments];
        if (container) container.innerHTML = app.comments[postId].map(c => `<div class="comment">${c.body}</div>`).join('');
    } catch (err) {
        console.error('Load comments error:', err);
    }
}

export async function addComment(app, postId, body, textarea = null) {
    if (!body) return;

    try {
        await fetch(`${app.BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, body, name: 'User', email: 'user@example.com' })
        });

        if (!app.comments[postId]) app.comments[postId] = [];
        app.comments[postId].push({ body, name: 'You' });

        // Re-render comments
        const container = document.getElementById(`comments-${postId}`) || document.getElementById('comments');
        if (container) {
            container.innerHTML = app.comments[postId]
                .map(c => `<div class="comment"><strong>${c.name || 'You'}:</strong> ${c.body}</div>`)
                .join('');
        }

        // Clear the textarea if we were passed one
        if (textarea) textarea.value = '';
    } catch (err) {
        console.error('Add comment error:', err);
    }
}