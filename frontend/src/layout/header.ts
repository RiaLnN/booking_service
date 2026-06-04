import { Store } from "../store";
import { openAuthModal } from "./auth";
import { Icons } from "../ui/icons";

export const getHeader = (onUpdate: () => void): HTMLElement => {
    const header = document.createElement('header');
    header.className = 'main-header';

    const isAuth = !!Store.token;
    const initial = Store.username?.charAt(0).toUpperCase() ?? '?';

    const adminBtn = isAuth && Store.isAdmin
        ? `<button class="btn-header btn-admin" id="admin-trigger">
               ${Icons.shield} Admin
           </button>`
        : '';

    const userBlock = isAuth
        ? `<div class="username-chip">
               <div class="username-avatar">${initial}</div>
               <span>${Store.username}</span>
           </div>
           ${adminBtn}
           <button class="btn-header btn-logout" id="logout-trigger">${Icons.logOut} Log Out</button>`
        : `<button class="btn-header btn-signin" id="login-trigger">${Icons.signIn} Sign In</button>`;

    header.innerHTML = `
        <div class="container header-wrapper">
            <div class="logo">
                <div class="logo-icon">${Icons.logoCalendar}</div>
                BOOKING
                <div class="logo-dot"></div>
            </div>
            <div class="user-block">${userBlock}</div>
        </div>
    `;

    header.querySelector('#login-trigger')?.addEventListener('click', openAuthModal);

    header.querySelector('#logout-trigger')?.addEventListener('click', () => {
        Store.updateStore = { user: { id: 0, username: '', is_admin: false }, token: '' };
        Store.currentRoomId = 0;
        Store.currentView = 'rooms';
        onUpdate();
    });

    header.querySelector('#admin-trigger')?.addEventListener('click', () => {
        Store.currentView = Store.currentView === 'admin' ? 'rooms' : 'admin';
        Store.currentRoomId = 0;
        onUpdate();
    });

    return header;
};