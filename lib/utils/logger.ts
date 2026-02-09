/**
 * Unified Client Logger for LMS Admin Frontend
 * Provides structured console logging with automatic sanitization.
 * 
 * Features:
 * - Consistent prefix: [LMS-ADMIN]
 * - Log levels: info, warn, error
 * - Automatic sanitization of sensitive data
 * - Browser-safe (uses console methods)
 */

// Sensitive keys that should never appear in logs
const SENSITIVE_KEYS = [
    'authorization',
    'password',
    'accesstoken',
    'access_token',
    'refreshtoken',
    'refresh_token',
    'token',
    'secret',
    'cookie',
];

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

/**
 * Recursively sanitizes an object by removing/masking sensitive keys
 */
function sanitize(obj: unknown, depth = 0): unknown {
    if (depth > 5) return '[MAX_DEPTH]';
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        // Check if string looks like a JWT or token
        if (obj.match(/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/)) {
            return '[REDACTED_TOKEN]';
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item, depth + 1));
    }

    if (typeof obj === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            const lowerKey = key.toLowerCase();
            if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = sanitize(value, depth + 1);
            }
        }
        return sanitized;
    }

    return obj;
}

function formatTimestamp(): string {
    return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string): string {
    return `[LMS-ADMIN][${level}][${formatTimestamp()}] ${message}`;
}

export const logger = {
    info(message: string, context?: Record<string, unknown>): void {
        const formattedMsg = formatMessage('INFO', message);
        if (context) {
            console.log(formattedMsg, sanitize(context));
        } else {
            console.log(formattedMsg);
        }
    },

    warn(message: string, context?: Record<string, unknown>): void {
        const formattedMsg = formatMessage('WARN', message);
        if (context) {
            console.warn(formattedMsg, sanitize(context));
        } else {
            console.warn(formattedMsg);
        }
    },

    error(message: string, context?: Record<string, unknown>, error?: Error): void {
        const formattedMsg = formatMessage('ERROR', message);
        if (error) {
            console.error(formattedMsg, sanitize(context), {
                errorName: error.name,
                errorMessage: error.message,
                stack: error.stack,
            });
        } else if (context) {
            console.error(formattedMsg, sanitize(context));
        } else {
            console.error(formattedMsg);
        }
    },
};

export default logger;
