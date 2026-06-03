import apiClient from "../instance";
import type { Room } from "../../types/resource";
import { ROUTES } from "../config";

export const ResuorceService = {
    list: async () => {
        const { data }  = await apiClient.get<Room[]>(ROUTES.roomList());
        return data;
    }
}