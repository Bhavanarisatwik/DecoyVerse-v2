import { apiClient } from '../client';

export interface Decoy {
    id: string;
    node_id: string;
    name: string;
    type: 'service' | 'file' | 'honeytoken' | 'configuration' | 'port';
    status: 'active' | 'inactive';
    triggers: number;
    last_triggered?: string;
    port?: number;
    format?: string;
}

export const decoysApi = {
    /**
     * Get decoys for a specific node
     */
    async getNodeDecoys(nodeId: string): Promise<{ success: boolean; data: Decoy[] }> {
        try {
            const response = await apiClient.get(`/nodes/${nodeId}/decoys`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all decoys
     */
    async getDecoys(): Promise<{ success: boolean; data: Decoy[] }> {
        try {
            const response = await apiClient.get('/api/decoys');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update decoy status
     */
    async updateDecoyStatus(id: string, status: string): Promise<{ success: boolean; data: Decoy }> {
        try {
            const response = await apiClient.patch(`/api/decoys/${id}`, { status });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },
};
