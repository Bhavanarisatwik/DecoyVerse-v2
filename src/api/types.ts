// User type
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    avatar?: string;
    createdAt?: string;
    lastLogin?: string;
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: { msg: string; path: string }[];
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
