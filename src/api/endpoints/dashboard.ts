import { apiClient } from '../client';

export interface Alert {
    id: string;
    node_id: string;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    created_at: string;
    status: 'new' | 'acknowledged' | 'resolved';
}

export interface Attack {
    id: string;
    node_id: string;
    attack_type: string;
    source_ip: string;
    timestamp: string;
    risk_score: number;
}

export interface DashboardStats {
    total_nodes: number;
    active_nodes: number;
    total_attacks: number;
    active_alerts: number;
    high_risk_count: number;
    avg_risk_score: number;
    recent_risk_average?: number;
}

export const dashboardApi = {
    /**
     * Get dashboard statistics
     */
    async getStats(): Promise<{ success: boolean; data: DashboardStats }> {
        try {
            const response = await apiClient.get('/api/stats');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get recent alerts
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
     * Get recent attacks
     */
    async getRecentAttacks(limit: number = 20): Promise<{ success: boolean; data: Attack[] }> {
        try {
            const response = await apiClient.get('/api/recent-attacks', {
                params: { limit },
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
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId: string): Promise<{ success: boolean }> {
        try {
            await apiClient.patch(`/api/alerts/${alertId}`, { status: 'acknowledged' });
            return {
                success: true,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Resolve an alert
     */
    async resolveAlert(alertId: string): Promise<{ success: boolean }> {
        try {
            await apiClient.patch(`/api/alerts/${alertId}`, { status: 'resolved' });
            return {
                success: true,
            };
        } catch (error) {
            throw error;
        }
    },
};
