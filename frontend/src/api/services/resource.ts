import apiClient from "../instance";
import { ROUTES } from "../config";
import type { Room, RoomCreate } from "../../types/resource";
import type { BookResponse } from "../../types/booking";

export const ResourceService = {
    list: async (): Promise<Room[]> => {
        const { data } = await apiClient.get<Room[]>(ROUTES.roomList());
        return data;
    },
    create: async (payload: RoomCreate): Promise<Room> => {
        const { data } = await apiClient.post<Room>(ROUTES.roomCreate(), payload);
        return data;
    },
    remove: async (id: number): Promise<void> => {
        await apiClient.delete(ROUTES.roomDelete(id));
    },
    timeline: async (id: number, date?: string): Promise<BookResponse[]> => {
        const { data } = await apiClient.get<{ timeline: BookResponse[] }>(ROUTES.roomTimeline(id, date));
        return data.timeline ?? [];
    },
};