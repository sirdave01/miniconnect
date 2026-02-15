import { setToStorage } from "./localstorage.mjs";

export function handleFollow(app, event) {
    const button = event.target;
    const userId = parseInt(button.dataset.userId); 

    if (app.followedUsers.has(userId)) {
        app.followedUsers.delete(userId);
        button.textContent = 'Follow';
    } else {
        app.followedUsers.add(userId);
        button.textContent = 'Unfollow';
    }
    setToStorage('followedUsers', Array.from(app.followedUsers)); 
}