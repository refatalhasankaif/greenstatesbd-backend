/* eslint-disable no-console */
const isDev = process.env.NODE_ENV === "development";

export const logger = {
    info: (message: string, meta?: unknown) => {
        console.log(`📌📌📌 [INFO]: ${message}`, meta || "");
    },

    error: (message: string, error?: unknown) => {
        console.error(`❌❌❌ [ERROR]: ${message}`, error || "");
    },

    warn: (message: string) => {
        console.warn(`⚠️⚠️⚠️ [WARN]: ${message}`);
    },

    debug: (message: string, meta?: unknown) => {
        if (isDev) {
            console.debug(`🐛🐛🐛 [DEBUG]: ${message}`, meta || "");
        }
    },
};