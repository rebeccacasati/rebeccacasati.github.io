'use strict';

// The page and navigation remain usable without JavaScript.
const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme;
try { savedTheme = localStorage.getItem('theme'); } catch { /* Storage may be disabled. */ }
function applyTheme(theme) {
    root.dataset.theme = theme;
    themeButton.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
}
applyTheme(['light', 'dark'].includes(savedTheme) ? savedTheme : (systemTheme.matches ? 'dark' : 'light'));
themeButton.hidden = false;
themeButton.addEventListener('click', () => {
    savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(savedTheme);
    try { localStorage.setItem('theme', savedTheme); } catch { /* Theme still works for this visit. */ }
});
systemTheme.addEventListener('change', event => {
    if (!['light', 'dark'].includes(savedTheme)) applyTheme(event.matches ? 'dark' : 'light');
});

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#nav-links');
const mobile = window.matchMedia('(max-width: 700px)');
function setMenu(open) {
    menuButton.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-collapsed', mobile.matches && !open);
}
menuButton.hidden = false;
setMenu(!mobile.matches);
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.addEventListener('click', event => {
    if (event.target.closest('a') && mobile.matches) setMenu(false);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
    }
});
mobile.addEventListener('change', () => setMenu(!mobile.matches));
