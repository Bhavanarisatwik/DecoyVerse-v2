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
REM DecoyVerse Agent Installer Batch Script
REM Node: ${nodeName}
REM Auto-generated - do not edit

setlocal enabledelayedexpansion
set INSTALLER_EXE=%TEMP%\\DecoyVerse-Installer-${Date.now()}.exe
set INSTALLER_LOG=%TEMP%\\DecoyVerse-Install.log

cls
echo.
echo ========================================
echo     DecoyVerse Agent Installer v2.0
echo ========================================
echo Node: ${nodeName}
echo.
echo Step 1: Downloading installer...
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'https://github.com/Bhavanarisatwik/ML-modle-v0/releases/download/v2.0.0/DecoyVerse-Installer.exe' -OutFile '!INSTALLER_EXE!' -UseBasicParsing; exit 0 } catch { exit 1 }"
if errorlevel 1 (
    echo [ERROR] Failed to download installer
    goto :cleanup
)
echo [SUCCESS] Downloaded installer
echo.
echo Step 2: Running installer with node configuration...
echo [INFO] This will request Administrator privileges...
echo [INFO] A window will appear - installation is running...
echo.
"!INSTALLER_EXE!" --node-id "${nodeId}" --api-key "${apiKey}" --node-name "${nodeName}" >> "!INSTALLER_LOG!" 2>&1
if errorlevel 1 (
    echo [ERROR] Installation failed
    echo [INFO] Check log file: !INSTALLER_LOG!
) else (
    echo [SUCCESS] Agent installed and running
    echo [INFO] Agent will start automatically on next logon
)

:cleanup
echo.
echo Step 3: Cleaning up temporary files...
REM Give the installer time to fully release the file
timeout /t 2 /nobreak
if exist "!INSTALLER_EXE!" (
    del /f /q "!INSTALLER_EXE!" 2>nul
    if errorlevel 1 (
        echo [WARNING] Could not delete installer file - Windows will clean it up automatically
    ) else (
        echo [SUCCESS] Cleaned up installer file
    )
)
echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
pause
endlocal
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
