import { apiClient } from '../client';

export interface Event {
    id: string;
    node_id: string;
    timestamp: string;
    event_type: string;
    source_ip: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    decoy_name: string;
    risk_score: number;
}

export const logsApi = {
    /**
     * Get recent events/attacks
     */
    async getRecentEvents(limit: number = 20, nodeId?: string): Promise<{ success: boolean; data: Event[] }> {
        try {
            const params: any = { limit };
            if (nodeId) params.node_id = nodeId;

            const response = await apiClient.get('/recent-attacks', { params });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },
};
