export const ROUTES = {
    resiter: () => `/auth/register`,
    login: () => `/auth/login`,
    slotList: (room_id: number) => `/resources/${room_id}/date`,
    roomList: () => `/resources`,
    book: () => `/booking/book`
}