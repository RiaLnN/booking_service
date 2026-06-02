import axios from "axios";
import { SETTINGS } from "../config";

const apiClient = axios.create({
    baseURL: SETTINGS.BASE_URL,
    timeout: 1000,
    headers: {
        "Content-Type": "application/json"
    }
});

apiClient.interceptors.request.use(
    (config) => {
        const token = window.localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export default apiClient