const globalForRateLimit = globalThis as unknown as {
    loginAttempts: Map<string, { count: number; lockUntil?: number; lastAttempt: number }>;
};

const loginAttempts = globalForRateLimit.loginAttempts || new Map<string, { count: number; lockUntil?: number; lastAttempt: number }>();

if (process.env.NODE_ENV !== "production") {
    globalForRateLimit.loginAttempts = loginAttempts;
}

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;
const CLEANUP_INTERVAL = 60 * 60 * 1000;

export function checkRateLimit(identifier: string): {
    allowed: boolean;
    remainingAttempts?: number;
    lockUntil?: number;
} {
    const now = Date.now();
    const attempt = loginAttempts.get(identifier);

    if (attempt && attempt.lockUntil && attempt.lockUntil <= now) {
        loginAttempts.delete(identifier);
        return checkRateLimit(identifier);
    }

    if (!attempt) {
        loginAttempts.set(identifier, { count: 1, lastAttempt: now });
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
    }

    if (attempt.lockUntil && attempt.lockUntil > now) {
        return {
            allowed: false,
            lockUntil: attempt.lockUntil,
        };
    }

    if (attempt.count >= MAX_ATTEMPTS) {
        const lockUntil = now + LOCK_TIME;
        loginAttempts.set(identifier, { ...attempt, count: attempt.count + 1, lockUntil, lastAttempt: now });
        return { allowed: false, lockUntil };
    }

    loginAttempts.set(identifier, { ...attempt, count: attempt.count + 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempt.count - 1 };
}

export function resetLoginAttempts(identifier: string) {
    loginAttempts.delete(identifier);
}


// Ensure interval is set only once
const globalForInterval = globalThis as unknown as {
    rateLimitInterval: NodeJS.Timeout | null;
};

if (!globalForInterval.rateLimitInterval) {
    globalForInterval.rateLimitInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, value] of loginAttempts.entries()) {
            const isLocked = value.lockUntil && value.lockUntil > now;
            const isStale = now - value.lastAttempt > CLEANUP_INTERVAL;

            if (!isLocked && isStale) {
                loginAttempts.delete(key);
            }
        }
    }, CLEANUP_INTERVAL);
}
