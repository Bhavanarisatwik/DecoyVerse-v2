import { apiClient } from '../client';

export interface Node {
    id: string;
    node_id?: string;
    name: string;
    status: 'online' | 'offline' | 'active' | 'inactive';
    ip?: string;
    os?: string;
    version?: string;
    decoys?: number;
    lastSeen?: string;
    node_api_key?: string;
    user_id?: string;
    created_at?: string;
    deployment_config?: {
        initial_decoys: number;
        initial_honeytokens: number;
        deploy_path?: string | null;
    };
}

const normalizeNode = (node: any): Node => ({
    id: node.id || node.node_id || '',
    node_id: node.node_id || node.id,
    name: node.name || 'Unnamed Node',
    status: node.status || 'offline',
    ip: node.ip_address || node.ip,
    os: node.os_type || node.os,
    version: node.version,
    decoys: node.decoys || node.decoy_count || 0,
    lastSeen: node.lastSeen || node.last_seen || 'Never',
    node_api_key: node.node_api_key || node.api_key || '',
    user_id: node.user_id,
    created_at: node.created_at,
    deployment_config: node.deployment_config,
});

export interface CreateNodeRequest {
    name: string;
    os?: string;
    initialDecoys?: number;
    initialHoneytokens?: number;
}

export interface CreateNodeResponse {
    node_id: string;
    name: string;
    node_api_key: string;
    user_id: string;
    os?: string;
    initialDecoys?: number;
    initialHoneytokens?: number;
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
     * Create a new node with optional initial deployment config
     */
    async createNode(name: string, config?: { os?: string; initialDecoys?: number; initialHoneytokens?: number }): Promise<{ success: boolean; data: CreateNodeResponse }> {
        try {
            const response = await apiClient.post('/nodes', {
                name,
                os_type: config?.os || 'windows',
                deployment_config: {
                    initial_decoys: config?.initialDecoys ?? 3,
                    initial_honeytokens: config?.initialHoneytokens ?? 5
                }
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
     * List all nodes for the user
     */
    async listNodes(): Promise<{ success: boolean; data: Node[] }> {
        try {
            const response = await apiClient.get('/nodes');
            return {
                success: true,
                data: Array.isArray(response.data) ? response.data.map(normalizeNode) : [],
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
                data: normalizeNode(response.data),
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
            const url = `/nodes/${nodeId}/agent-download`;
            console.log('nodesApi.downloadAgent - Full URL:', apiClient.defaults.baseURL + url);
            console.log('nodesApi.downloadAgent - nodeId:', nodeId);
            console.log('nodesApi.downloadAgent - Endpoint:', url);

            const response = await apiClient.get(url, {
                responseType: 'blob',
            });
            console.log('Download response received:', response.status);
            return response.data;
        } catch (error) {
            console.error('downloadAgent error details:', error);
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
