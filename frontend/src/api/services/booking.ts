import apiClient from "../instance";
import { ROUTES } from "../config";
import type { BookResponse, BookCreate } from "../../types/booking";

export const BookingService = {
    list: async (roomId: number): Promise<BookResponse[]> => {
        const { data } = await apiClient.get<{ timeline: BookResponse[] }>(ROUTES.roomTimeline(roomId));
        return data.timeline ?? [];
    },
    occupy: async (bookId: number): Promise<BookResponse> => {
        const { data } = await apiClient.patch<BookResponse>(ROUTES.bookOccupy(bookId));
        return data;
    },
    create: async (payload: BookCreate): Promise<BookResponse> => {
        const { data } = await apiClient.post<BookResponse>(ROUTES.bookCreate(), payload);
        return data;
    },
    my: async (): Promise<BookResponse[]> => {
        const { data } = await apiClient.get<BookResponse[]>(ROUTES.bookMy());
        return data;
    },
    remove: async (bookId: number): Promise<void> => {
        await apiClient.delete(ROUTES.bookDelete(bookId));
    },
};