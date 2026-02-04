import { apiClient } from '../client';

export interface Alert {
    id: string;
    node_id: string;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    created_at: string;
    status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
}

export const alertsApi = {
    /**
     * Get all alerts
     */
    async getAlerts(limit: number = 10, offset: number = 0): Promise<{ success: boolean; data: Alert[] }> {
        try {
            const response = await apiClient.get('/api/alerts', {
                params: { limit, offset },
            });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update alert status
     */
    async updateAlertStatus(id: string, status: string): Promise<{ success: boolean; data: Alert }> {
        try {
            const response = await apiClient.patch(`/api/alerts/${id}`, { status });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },
};
