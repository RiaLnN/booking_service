import apiClient from "../instance";
import type { Slot } from "../../types/booking";
import { ROUTES } from "../config";

export const SlotsService = {
    list: async (room_id: number) => {
        const { data } = await apiClient.get<Slot[]>(ROUTES.slotList(room_id))
        return data
    }
}