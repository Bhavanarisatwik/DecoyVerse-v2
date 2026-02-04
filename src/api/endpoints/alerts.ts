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

const normalizeAlert = (alert: any): Alert => ({
    id: alert.id || alert._id || alert.alert_id || '',
    node_id: alert.node_id || '',
    alert_type: alert.alert_type || alert.attack_type || alert.activity || 'Alert',
    severity: (alert.severity || 'low').toLowerCase(),
    message: alert.message || alert.payload || alert.activity || 'Alert triggered',
    created_at: alert.created_at || alert.timestamp || '',
    status: alert.status || 'open',
});

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
                data: Array.isArray(response.data) ? response.data.map(normalizeAlert) : [],
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
                data: normalizeAlert(response.data),
            };
        } catch (error) {
            throw error;
        }
    },
};
