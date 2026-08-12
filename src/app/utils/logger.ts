import { ENV } from "../config/env";

export const logger = {
  log: (...args: unknown[]) => {
    if (ENV.ENABLE_LOGS) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (ENV.ENABLE_LOGS) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
