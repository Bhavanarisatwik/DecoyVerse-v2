import axios, { AxiosInstance, AxiosError } from 'axios';
import {
    generateMockStats,
    generateMockAlerts,
    generateMockAttacks,
    generateMockNodes,
    generateMockDecoys,
} from './mockData';

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

// ----- DEMO MODE OVERRIDES -----
const isDemoMode = () => localStorage.getItem('isDemo') === 'true';

const originalGet = apiClient.get;
apiClient.get = (async function (this: any, url: string, config?: any) {
    if (isDemoMode()) {
        if (url.includes('/api/stats') || url.includes('/nodes/stats')) {
            return Promise.resolve({ data: generateMockStats(), status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
        }
        if (url.includes('/api/alerts')) {
            return Promise.resolve({ data: generateMockAlerts(), status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
        }
        if (url.includes('/api/recent-attacks') || url.includes('/api/logs')) {
            return Promise.resolve({ data: generateMockAttacks(), status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
        }
        if (url === '/nodes') {
            return Promise.resolve({ data: generateMockNodes(), status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
        }
        if (url.includes('/decoys')) {
            return Promise.resolve({ data: generateMockDecoys(), status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
        }
        // Fallback for demo mode matching nothing
        return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
    }
    return originalGet.apply(this, [url, config]);
}) as any;

const originalPost = apiClient.post;
apiClient.post = (async function (this: any, url: string, data?: any, config?: any) {
    if (isDemoMode()) {
        if (url.includes('/nodes')) {
            return Promise.resolve({ data: { ...data, node_id: 'mock-node-xxx', node_api_key: 'mock-key' }, status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
        }
        if (url.includes('/decoys')) {
            return Promise.resolve({ data: [], status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
        }
        return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
    }
    return originalPost.apply(this, [url, data, config]);
}) as any;

const originalDelete = apiClient.delete;
apiClient.delete = (async function (this: any, url: string, config?: any) {
    if (isDemoMode()) {
        return Promise.resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {} as any, config: config || {} as any });
    }
    return originalDelete.apply(this, [url, config]);
}) as any;
// ------------------------------

export default apiClient;
