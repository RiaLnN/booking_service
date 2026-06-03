import type { UserResponse } from "./types/user";

export const Store = {
    _token: localStorage.getItem('token') || null,
    userId: Number(localStorage.getItem('userId')) || null,
    username: localStorage.getItem('username') || null,
    currentRoomId: 0,

    get token() {
        return this._token;
    },

    set updateStore(dataIn: UserResponse) {
        if (dataIn.token) {
            this._token = dataIn.token;
            this.userId = dataIn.user.id || null;
            this.username = dataIn.user.username || null;
            localStorage.setItem('token', dataIn.token);
            localStorage.setItem('userId', String(dataIn.user.id));
            localStorage.setItem('username', dataIn.user.username);
        } else {
            this._token = null;
            this.userId = null;
            this.username = null;
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
        }
    }
};