import axios, { AxiosInstance, AxiosError } from 'axios';

// Backend URLs
const EXPRESS_API_URL = import.meta.env.VITE_EXPRESS_API_URL || 'http://localhost:5000/api';
const FASTAPI_API_URL = import.meta.env.VITE_FASTAPI_API_URL || 'http://localhost:8000';

// Express backend (auth only)
export const authClient: AxiosInstance = axios.create({
    baseURL: EXPRESS_API_URL,
    timeout: 60000,  // 60 seconds (Fixed for Render cold starts)
    headers: {
        'Content-Type': 'application/json',
    },
});

// FastAPI backend (nodes, decoys, alerts, logs, ai-insights, honeytokels)
export const apiClient: AxiosInstance = axios.create({
    baseURL: FASTAPI_API_URL,
    timeout: 60000,  // 60 seconds (Render free tier cold starts can take 30-60s)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptors to both clients
const addAuthInterceptors = (client: AxiosInstance) => {
    client.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/auth/login';
                }
            }
            return Promise.reject(error);
        }
    );
};

addAuthInterceptors(authClient);
addAuthInterceptors(apiClient);

export default apiClient;
