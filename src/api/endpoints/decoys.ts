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
    // Deployment location info
    file_path?: string;
    deploy_location?: string;
    node_name?: string;
    deployed_at?: string;
    auto_deployed?: boolean;
}

const normalizeDecoy = (decoy: any): Decoy => ({
    id: decoy.id || decoy._id || decoy.decoy_id || '',
    node_id: decoy.node_id || '',
    name: decoy.name || decoy.file_name || decoy.decoy_name || 'Unknown',
    type: decoy.type || 'file',
    status: decoy.status || 'active',
    triggers: decoy.triggers ?? decoy.triggers_count ?? decoy.trigger_count ?? 0,
    last_triggered: decoy.last_triggered || decoy.last_accessed || decoy.last_seen,
    port: decoy.port,
    format: decoy.format,
    // Deployment location info
    file_path: decoy.file_path || decoy.path || decoy.location,
    deploy_location: decoy.deploy_location || decoy.file_path || decoy.path,
    node_name: decoy.node_name,
    deployed_at: decoy.deployed_at || decoy.created_at,
    auto_deployed: decoy.auto_deployed ?? false,
});

export const decoysApi = {
    /**
     * Get decoys for a specific node
     */
    async getNodeDecoys(nodeId: string): Promise<{ success: boolean; data: Decoy[] }> {
        try {
            const response = await apiClient.get(`/api/decoys/node/${nodeId}`);
            return {
                success: true,
                data: Array.isArray(response.data) ? response.data.map(normalizeDecoy) : [],
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
                data: Array.isArray(response.data) ? response.data.map(normalizeDecoy) : [],
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
                data: normalizeDecoy(response.data),
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Deploy new honeytokens on a node
     */
    async deployHoneytokens(nodeId: string, count: number): Promise<{ success: boolean; data: Decoy[] }> {
        try {
            const response = await apiClient.post(`/api/decoys/deploy`, {
                node_id: nodeId,
                count: count,
            });
            return {
                success: true,
                data: Array.isArray(response.data) ? response.data.map(normalizeDecoy) : [],
            };
        } catch (error) {
            throw error;
        }
    },
};
