const BASE = 'https://jsonplaceholder.typicode.com';

export async function getPosts() {
    const res = await fetch(`${BASE}/posts?_limit=20`);
    return res.json();
}

export async function getUsers() {
    const res = await fetch(`${BASE}/users`);
    return res.json();
}

export async function createPost(title, body, userId = 1) {
    const res = await fetch(`${BASE}/posts`, {
        method: 'POST',
        body: JSON.stringify({ title, body, userId }),
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
    });
    return res.json(); // fake response
}

export async function likePost(id) {
    // Simulate PATCH
    await fetch(`${BASE}/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ likes: 1 }), // fake field
        headers: { 'Content-type': 'application/json' },
    });
}

export async function deletePost(id) {
    await fetch(`${BASE}/posts/${id}`, { method: 'DELETE' });
}

export async function getComments(postId) {
    const res = await fetch(`${BASE}/posts/${postId}/comments`);
    return res.json();
}