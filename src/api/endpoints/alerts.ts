import { apiClient } from '../client';

export interface Alert {
    id: string;
    node_id: string;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    risk_score?: number;
    message: string;
    created_at: string;
    status: 'open' | 'acknowledged' | 'investigating' | 'resolved';
    notified?: boolean;
    notification_status?: 'sent' | 'failed' | 'no_channels' | null;
}

const severityFromRiskScore = (score: number): Alert['severity'] => {
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
};

const normalizeAlert = (alert: any): Alert => {
    const riskScore: number | undefined = alert.risk_score ?? alert.riskScore;
    const severity: Alert['severity'] = alert.severity
        ? (alert.severity as string).toLowerCase() as Alert['severity']
        : riskScore !== undefined
            ? severityFromRiskScore(riskScore)
            : 'low';
    return {
        id: alert.id || alert._id || alert.alert_id || '',
        node_id: alert.node_id || '',
        alert_type: alert.alert_type || alert.attack_type || alert.activity || 'Alert',
        severity,
        risk_score: riskScore,
        message: alert.message || alert.payload || alert.activity || 'Alert triggered',
        created_at: alert.created_at || alert.timestamp || '',
        status: alert.status || 'open',
        notified: alert.notified ?? false,
        notification_status: alert.notification_status ?? null,
    };
};

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

    /**
     * Queue an IP address for firewall blocking on the specified node.
     * The agent picks it up on the next heartbeat (~30s) and applies the Windows
     * Firewall rule via the privilege-separated dv_firewall helper.
     */
    async blockIp(ip_address: string, node_id: string, alert_id?: string): Promise<{ success: boolean; status: string }> {
        try {
            const response = await apiClient.post('/api/block-ip', { ip_address, node_id, alert_id });
            return { success: true, status: response.data.status ?? 'pending' };
        } catch (error) {
            throw error;
        }
    },
};
