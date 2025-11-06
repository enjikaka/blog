import "./kb-book.js";
import "./lastfm-status.js";

if (document.documentElement.getAttribute('data-current') === 'gallery') {
    document.addEventListener('pointerdown', e  => {
        console.log(e.target, e.composedPath);
    });
}