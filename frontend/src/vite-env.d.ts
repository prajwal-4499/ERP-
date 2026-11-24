/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    isElectron: boolean;
    printThermal: (options: { htmlContent: string; printerName?: string; silent?: boolean }) => Promise<{ success: boolean; error?: string }>;
    verifyPin: (pin: string, action?: string, module?: string) => Promise<{ valid: boolean }>;
    getPrinters: () => Promise<Array<{ name: string; isDefault: boolean }>>;
  };
}
