// Simple logging utility to control all logging in one place
const log = {
  debug: (message: string, ...args: any[]) => {
    // Set to true to enable debug logs
    const DEBUG_ENABLED = false;
    if (DEBUG_ENABLED) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    // Set to true to enable info logs
    const INFO_ENABLED = false;
    if (INFO_ENABLED) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  save: (id: number, message: string, ...args: any[]) => {
    // Set to true to enable save logs
    const SAVE_LOGS_ENABLED = false;
    if (SAVE_LOGS_ENABLED) {
      console.log(`[SAVE ${id}] ${message}`, ...args);
    }
  }
};

export default log;
