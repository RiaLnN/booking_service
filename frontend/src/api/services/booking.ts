import apiClient from "../instance";
import type { BookCreate, BookResponse } from "../../types/booking";
import { ROUTES } from "../config";

export const BookingService = {
    list: async (room_id: number) => {
        const { data }  = await apiClient.get<BookResponse[]>(ROUTES.slotList(room_id));
        return data;
    },
    book: async (dataIn: BookCreate) => {
        const { data } = await apiClient.post<BookResponse>(ROUTES.book(), dataIn);
        return data;
    }
}