import { initDarkMode } from "./modetoggle.mjs";

import { loadFeed } from "./feed.mjs";

document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
    loadFeed();
});