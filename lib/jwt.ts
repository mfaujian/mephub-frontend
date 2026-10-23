/** Read the expiry (exp, in seconds) from a JWT without verifying it. The server is the real authority. */
export function getTokenExpiry(token: string): number | null {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        const exp = (JSON.parse(json) as { exp?: number }).exp;
        return typeof exp === "number" ? exp : null;
    } catch {
        return null;
        }
}

/** True when the token is missing an expiry or is about to expire (30 s safety margin). */
export function isTokenExpired(token: string): boolean {
    const exp = getTokenExpiry(token);
    if (exp === null) return true;
    return exp * 1000 <= Date.now() + 30_000;
}