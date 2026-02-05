import { apiClient } from '../client';

/**
 * Installation API
 * Generate and download pre-configured agent installers
 */

export const installApi = {
  /**
   * Download node-specific Windows installer
   * Creates a batch script that downloads EXE and runs it with node configuration
   */
  async downloadWindowsInstaller(nodeId: string, nodeName: string, apiKey: string): Promise<void> {
    try {
      // Generate batch script content
      const batchScript = `@echo off
echo ========================================
echo DecoyVerse Agent Installer
echo Node: ${nodeName}
echo ========================================
echo.
echo Step 1: Downloading installer...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/Bhavanarisatwik/ML-modle-v0/releases/download/v2.0.0/DecoyVerse-Installer.exe' -OutFile '%TEMP%\\DecoyVerse-Installer.exe'"
if errorlevel 1 (
    echo ERROR: Failed to download installer
    pause
    exit /b 1
)
echo SUCCESS: Downloaded installer
echo.
echo Step 2: Running installer with node configuration...
echo This will request Administrator privileges...
echo.
"%TEMP%\\DecoyVerse-Installer.exe" --node-id "${nodeId}" --api-key "${apiKey}" --node-name "${nodeName}"
if errorlevel 1 (
    echo ERROR: Installation failed
) else (
    echo SUCCESS: Agent installed and running
)
echo.
echo Cleaning up...
del "%TEMP%\\DecoyVerse-Installer.exe"
echo.
echo Installation complete!
pause
`;

      // Create and download blob
      const blob = new Blob([batchScript], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Install-DecoyVerse-${nodeName.replace(/\s+/g, '-')}.bat`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating Windows installer:', err);
      throw err;
    }
  },

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
