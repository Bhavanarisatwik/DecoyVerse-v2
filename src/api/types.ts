// User type
export interface AISettings {
    provider?: string;   // 'openai' | 'openrouter' | 'gemini'
    model?: string;
    apiKey?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'viewer';
    avatar?: string;
    isOnboarded?: boolean;
    createdAt?: string;
    lastLogin?: string;
    notifications?: NotificationSettings;
    aiSettings?: AISettings;
    vaultVerifier?: string;   // base64 AES-GCM blob — vault master password verifier
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

// Notification Settings
export interface NotificationSettings {
    slackWebhook?: string;
    emailSmtpUser?: string;
    emailSmtpPass?: string;
    emailAlertTo?: string;
    whatsappNumber?: string;
}

export interface UserProfileUpdateRequest {
    id: string;
    name?: string;
    email?: string;
    notifications?: NotificationSettings;
    aiSettings?: AISettings;
    vaultVerifier?: string;
}

// Security Report (from FastAPI POST/GET /api/ai/report)
export interface SecurityReport {
    user_id: string;
    generated_at: string;
    health_score: number;          // 0.0–10.0
    total_nodes: number;
    online_nodes: number;
    total_alerts: number;
    open_alerts: number;
    critical_alerts: number;       // risk_score >= 8
    top_attack_types: Array<{ type: string; count: number }>;
    top_attackers: Array<{
        ip: string;
        risk_score: number;
        attack_count: number;
        most_common_attack: string;
    }>;
    recent_events_count: number;
    recommendations: string[];
}

// Vault types
export interface VaultItem {
    _id: string;
    userId: string;
    title: string;
    username: string;
    encryptedPassword: string;   // JSON string: { iv: base64, ciphertext: base64 }
    url?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface VaultItemCreate {
    title: string;
    username: string;
    encryptedPassword: string;
    url?: string;
    notes?: string;
}

// Chat message for AI Advisor
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
