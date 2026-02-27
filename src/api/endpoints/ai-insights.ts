import { apiClient } from '../client';
import type { SecurityReport } from '../types';

export interface AttackerProfile {
    ip: string;
    threat_name: string;
    confidence: number;
    ttps: string[];
    description: string;
    activity_count: number;
    last_seen?: string;
}

export const aiInsightsApi = {
    /**
     * Get attacker profile analysis for an IP
     */
    async getAttackerProfile(ip: string): Promise<{ success: boolean; data: AttackerProfile }> {
        try {
            const response = await apiClient.get(`/api/ai/attacker-profile/${ip}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },
};

export const securityReportApi = {
    /**
     * POST /api/ai/report — generate & save a new security report (replaces old)
     */
    async generateReport(): Promise<SecurityReport> {
        const response = await apiClient.post<SecurityReport>('/api/ai/report');
        return response.data;
    },

    /**
     * GET /api/ai/report — retrieve the last saved security report
     */
    async getReport(): Promise<{ exists: boolean; report: SecurityReport | null }> {
        const response = await apiClient.get<{ exists: boolean; report: SecurityReport | null }>('/api/ai/report');
        return response.data;
    },
};
