import { Store } from "../store";
import { openAuthModal } from "./auth";

const CalendarIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const LogOutIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

const SignInIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;

export const getHeader = (onLogoutSuccess: () => void): HTMLElement => {
    const header = document.createElement('header');
    header.className = 'main-header';

    const isAuth = !!Store.token;
    const initial = Store.username ? Store.username.charAt(0).toUpperCase() : '?';

    const userBlockContent = isAuth
        ? `<div class="username-chip">
                <div class="username-avatar">${initial}</div>
                <span>${Store.username}</span>
            </div>
            <button class="btn-header btn-logout" id="logout-trigger" title="Sign out">
                ${LogOutIcon}
                Log Out
            </button>`
        : `<button class="btn-header btn-signin" id="login-trigger">
                ${SignInIcon}
                Sign In
            </button>`;

    header.innerHTML = `
        <div class="container header-wrapper">
            <div class="logo">
                <div class="logo-icon">${CalendarIcon}</div>
                BOOKING
                <div class="logo-dot"></div>
            </div>
            <div class="user-block">
                ${userBlockContent}
            </div>
        </div>
    `;

    setTimeout(() => {
        header.querySelector('#login-trigger')?.addEventListener('click', openAuthModal);

        header.querySelector('#logout-trigger')?.addEventListener('click', () => {
            Store.updateStore = { user: { id: 0, username: '' }, token: '' };
            localStorage.clear();
            onLogoutSuccess();
        });
    }, 0);

    return header;
};