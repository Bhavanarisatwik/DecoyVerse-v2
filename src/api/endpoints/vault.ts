import { authClient } from '../client';
import type { VaultItem, VaultItemCreate } from '../types';

export const vaultApi = {
    /**
     * GET /api/vault — list all vault items for the authenticated user
     */
    async getItems(): Promise<{ success: boolean; data: VaultItem[] }> {
        const response = await authClient.get<{ success: boolean; data: VaultItem[] }>('/vault');
        return response.data;
    },

    /**
     * POST /api/vault — create a new vault item (password must already be encrypted)
     */
    async createItem(data: VaultItemCreate): Promise<{ success: boolean; data: VaultItem }> {
        const response = await authClient.post<{ success: boolean; data: VaultItem }>('/vault', data);
        return response.data;
    },

    /**
     * PUT /api/vault/:id — update an existing vault item
     */
    async updateItem(id: string, data: Partial<VaultItemCreate>): Promise<{ success: boolean; data: VaultItem }> {
        const response = await authClient.put<{ success: boolean; data: VaultItem }>(`/vault/${id}`, data);
        return response.data;
    },

    /**
     * DELETE /api/vault/:id — permanently delete a vault item
     */
    async deleteItem(id: string): Promise<{ success: boolean }> {
        const response = await authClient.delete<{ success: boolean }>(`/vault/${id}`);
        return response.data;
    },
};
