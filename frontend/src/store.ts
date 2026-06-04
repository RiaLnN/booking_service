import type { UserResponse } from "./types/user";

export const Store = {
    _token: localStorage.getItem('token') || null,
    userId: Number(localStorage.getItem('userId')) || null,
    username: localStorage.getItem('username') || null,
    isAdmin: localStorage.getItem('isAdmin') === 'true',
    currentRoomId: 0,
    currentView: 'rooms' as 'rooms' | 'dashboard' | 'admin',

    get token() {
        return this._token;
    },

    set updateStore(data: UserResponse) {
        if (data.token) {
            this._token = data.token;
            this.userId = data.user.id || null;
            this.username = data.user.username || null;
            this.isAdmin = data.user.is_admin ?? false;
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', String(data.user.id));
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('isAdmin', String(data.user.is_admin ?? false));
        } else {
            this._token = null;
            this.userId = null;
            this.username = null;
            this.isAdmin = false;
            localStorage.clear();
        }
    },
};