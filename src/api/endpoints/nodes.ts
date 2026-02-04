import { apiClient } from '../client';

export interface Node {
    id: string;
    name: string;
    status: 'online' | 'offline';
    ip?: string;
    os?: string;
    version?: string;
    decoys?: number;
    lastSeen?: string;
    node_api_key?: string;
    user_id?: string;
    created_at?: string;
}

export interface CreateNodeRequest {
    name: string;
}

export interface CreateNodeResponse {
    node_id: string;
    name: string;
    node_api_key: string;
    user_id: string;
}

export interface NodeDetailResponse {
    id: string;
    name: string;
    status: string;
    ip: string;
    os: string;
    version: string;
    node_api_key: string;
    user_id: string;
    created_at: string;
    last_seen: string;
    decoys: Array<{
        id: string;
        name: string;
        file_path: string;
        last_accessed: string;
    }>;
}

export const nodesApi = {
    /**
     * Create a new node
     */
    async createNode(name: string): Promise<{ success: boolean; data: CreateNodeResponse }> {
        try {
            const response = await apiClient.post('/nodes', { name });
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * List all nodes for the user
     */
    async listNodes(): Promise<{ success: boolean; data: Node[] }> {
        try {
            const response = await apiClient.get('/nodes');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get a specific node with details
     */
    async getNode(nodeId: string): Promise<{ success: boolean; data: NodeDetailResponse }> {
        try {
            const response = await apiClient.get(`/nodes/${nodeId}`);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update node status or properties
     */
    async updateNode(nodeId: string, updates: Partial<Node>): Promise<{ success: boolean; data: Node }> {
        try {
            const response = await apiClient.patch(`/nodes/${nodeId}`, updates);
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a node
     */
    async deleteNode(nodeId: string): Promise<{ success: boolean }> {
        try {
            await apiClient.delete(`/nodes/${nodeId}`);
            return {
                success: true,
            };
        } catch (error) {
            throw error;
        }
    },

    /**
     * Download agent installer for a node
     */
    async downloadAgent(nodeId: string): Promise<Blob> {
        try {
            const response = await apiClient.get(`/nodes/${nodeId}/agent-download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get decoys for a node
     */
    async getNodeDecoys(nodeId: string): Promise<{ success: boolean; data: any[] }> {
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
     * Get node stats
     */
    async getNodeStats(): Promise<{ success: boolean; data: { total: number; online: number; offline: number } }> {
        try {
            const response = await apiClient.get('/nodes/stats');
            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            throw error;
        }
    },
};
