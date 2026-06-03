export const ROUTES = {
    resiter: () => `/auth/register`,
    login: () => `/auth/login`,
    slotList: (room_id: number) => `/resources/${room_id}/timeline`,
    roomList: () => `/resources`,
    book: () => `/booking`
}