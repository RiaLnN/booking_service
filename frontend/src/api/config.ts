export const ROUTES = {
    register: () => `/auth/register`,
    login: () => `/auth/login`,
    roomList: () => `/resources`,
    roomCreate: () => `/resources`,
    roomDelete: (id: number) => `/resources/${id}`,
    roomTimeline: (id: number, date?: string) => date
        ? `/resources/${id}/date?date=${date}`
        : `/resources/${id}/date`,
    bookCreate: () => `/booking/create`,
    bookOccupy: (id: number) => `/booking/${id}`,
    bookMy: () => `/booking/my`,
    bookDelete: (id: number) => `/booking/${id}`,
};