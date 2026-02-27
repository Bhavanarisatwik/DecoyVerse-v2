import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import type { User, LoginRequest, SignupRequest } from '../api/types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginRequest) => Promise<{ success: boolean; message: string }>;
    signup: (data: SignupRequest) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const storedUserStr = localStorage.getItem('user');
    const [user, setUser] = useState<User | null>(
        storedUserStr ? (JSON.parse(storedUserStr) as User) : null
    );
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Check if user is authenticated on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Verify token with backend
                    const response = await authApi.getMe();
                    if (response.success && response.data) {
                        setUser(response.data.user);
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data: LoginRequest): Promise<{ success: boolean; message: string }> => {
        try {
            // Check for Demo Admin (handles both the standard and the typo they tried)
            const emailLower = data.email.toLowerCase();
            if ((emailLower === 'admin@gmail.com' || emailLower === 'admin@gamil.com' || emailLower === 'admin') && data.password === 'Admin@0265') {
                localStorage.setItem('isDemo', 'true');
                const demoUser: User = {
                    id: 'demo-admin-123',
                    name: 'Admin',
                    email: 'admin@gmail.com',
                    role: 'admin',
                    isOnboarded: true
                };
                localStorage.setItem('token', 'demo-token-bypass');
                localStorage.setItem('user', JSON.stringify(demoUser));
                setUser(demoUser);
                return { success: true, message: 'Welcome to Demo Mode!' };
            } else {
                localStorage.removeItem('isDemo');
            }

            const response = await authApi.login(data);

            if (response.success && response.data) {
                const { user, token } = response.data;

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                setUser(user);

                return { success: true, message: 'Login successful!' };
            }

            return { success: false, message: response.message || 'Login failed' };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, message };
        }
    };

    const signup = async (data: SignupRequest): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await authApi.signup(data);

            if (response.success && response.data) {
                const { user, token } = response.data;

                // Store in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                setUser(user);

                return { success: true, message: 'Account created successfully!' };
            }

            return { success: false, message: response.message || 'Signup failed' };
        } catch (error: any) {
            const message = error.response?.data?.message || 'Signup failed. Please try again.';
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/auth/login');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
