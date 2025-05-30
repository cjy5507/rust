export interface IStoreConfig {
  name: string;
  phone: string;
  message: string;
  visitDate: string;
  visitTime: string;
  carrier: string;
  startTime: string; // "HH:mm:ss"
}

export interface IStore {
  id: string;
  name: string;
  url: string;
  selector?: string;
  config: IStoreConfig;
}

export interface IAutomationProcess {
  stopped: boolean;
  browser?: any;
  abortController?: AbortController;
}

export type AutomationStatus = 'idle' | 'running' | 'success' | 'error' | 'contact' | 'typing' | 'pass-done';

export interface IAutomationResult {
  status: AutomationStatus;
  message: string;
} 