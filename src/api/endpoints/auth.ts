import { authClient } from '../client';
import type { ApiResponse, AuthResponse, LoginRequest, SignupRequest, User, UpdatePasswordRequest } from '../types';

export const authApi = {
    // Login
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        const response = await authClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data;
    },

    // Signup
    signup: async (data: SignupRequest): Promise<ApiResponse<AuthResponse>> => {
        const response = await authClient.post<ApiResponse<AuthResponse>>('/auth/signup', data);
        return response.data;
    },

    // Get current user
    getMe: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await authClient.get<ApiResponse<{ user: User }>>('/auth/me');
        return response.data;
    },

    // Logout
    logout: async (): Promise<ApiResponse<null>> => {
        const response = await authClient.post<ApiResponse<null>>('/auth/logout');
        return response.data;
    },

    // Update password
    updatePassword: async (data: UpdatePasswordRequest): Promise<ApiResponse<{ token: string }>> => {
        const response = await authClient.put<ApiResponse<{ token: string }>>('/auth/update-password', data);
        return response.data;
    },

    // Complete onboarding
    completeOnboarding: async (): Promise<ApiResponse<{ user: User }>> => {
        const response = await authClient.put<ApiResponse<{ user: User }>>('/auth/complete-onboarding');
        return response.data;
    },
};
