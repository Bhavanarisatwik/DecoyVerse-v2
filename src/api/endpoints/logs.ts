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

const normalizeEvent = (event: any): Event => ({
    id: event.id || event._id || '',
    node_id: event.node_id || '',
    timestamp: event.timestamp || '',
    event_type: event.event_type || event.activity || 'event',
    source_ip: event.source_ip || '',
    severity: (event.severity || 'low').toLowerCase(),
    decoy_name: event.decoy_name || event.related_decoy || event.file_accessed || '',
    risk_score: event.risk_score ?? 0,
});

export const logsApi = {
    /**
     * Get recent events/attacks
     */
    async getRecentEvents(limit: number = 20, nodeId?: string): Promise<{ success: boolean; data: Event[] }> {
        try {
            const params: any = { limit };
            if (nodeId) params.node_id = nodeId;

            const response = await apiClient.get('/api/logs', { params });
            return {
                success: true,
                data: Array.isArray(response.data) ? response.data.map(normalizeEvent) : [],
            };
        } catch (error) {
            throw error;
        }
    },
};
