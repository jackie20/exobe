export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export function isLocked(lockedUntil: Date | null): boolean {
  return Boolean(lockedUntil && lockedUntil > new Date());
}

export function nextLockoutState(failedAttempts: number) {
  const attempts = failedAttempts + 1;
  if (attempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    return { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) };
  }
  return { failedLoginAttempts: attempts, lockedUntil: null };
}
