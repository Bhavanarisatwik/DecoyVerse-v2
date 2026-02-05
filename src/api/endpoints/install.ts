import { apiClient } from '../client';

/**
 * Installation API
 * Generate and download pre-configured agent installers
 */

export const installApi = {
  /**
   * Generate and download a pre-configured installer for a node
   * Returns a ZIP file with agent config, installation script, and README
   */
  async generateInstaller(nodeId: string): Promise<Blob> {
    const response = await apiClient.post(
      `/install/generate-installer/${nodeId}`,
      {},
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Download installer as a file
   * Helper function to trigger browser download
   */
  async downloadInstaller(nodeId: string, nodeName: string): Promise<void> {
    try {
      const blob = await this.generateInstaller(nodeId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DecoyVerse-Agent-${nodeName.replace(/\s+/g, '-')}.zip`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download installer:', error);
      throw error;
    }
  },
};
