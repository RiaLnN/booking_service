import apiClient from "../instance";
import { ROUTES } from "../config";
import type { UserRegister, UserResponse, UserLogin } from "../../types/user";
import { Store } from "../../store";

export const AuthService = {
    register: async (dataIn: UserRegister) => {
        const { data } = await apiClient.post<UserResponse>(ROUTES.resiter(), dataIn);
        Store.updateStore = data;
        return data;
    },
    login: async (dataIn: UserLogin) => {
        const { data } = await apiClient.post<UserResponse>(ROUTES.login(), dataIn);
        Store.updateStore = data;
        return data;
    }
}