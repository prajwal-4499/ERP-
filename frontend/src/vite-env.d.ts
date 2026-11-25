/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    isElectron: boolean;
    printThermal: (options: { htmlContent: string; printerName?: string; silent?: boolean }) => Promise<{ success: boolean; error?: string }>;
    verifyPin: (pin: string, action?: string, module?: string) => Promise<{ valid: boolean }>;
    getPrinters: () => Promise<Array<{ name: string; isDefault: boolean; status?: number }>>;
    checkPrinterStatus: (printerName?: string) => Promise<{
      available: boolean;
      totalPrinters?: number;
      defaultPrinterName?: string | null;
      printer?: { name: string; isDefault: boolean; status?: number } | null;
      isDefault?: boolean;
      status?: any;
      error?: string;
    }>;
    showSaveDialog: (options: {
      title?: string;
      defaultPath?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    }) => Promise<{ canceled: boolean; filePath?: string }>;
    writeFileToDisk: (payload: { filePath: string; content: string; isBase64?: boolean }) => Promise<{ success: boolean; error?: string }>;
  };
}
