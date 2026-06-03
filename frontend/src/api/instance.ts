import axios from "axios";
import { SETTINGS } from "../config";
import { Store } from "../store";

const apiClient = axios.create({
    baseURL: SETTINGS.BASE_URL,
    timeout: 8000,
    headers: {
        "Content-Type": "application/json"
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = Store.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Store.updateStore = { user: { id: 0, username: '' }, token: '' };
        }
        return Promise.reject(error);
    }
);

export default apiClient;