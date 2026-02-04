import { apiClient } from '../client';

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
            const response = await apiClient.get(`/api/attacker-profile/${ip}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },
};
