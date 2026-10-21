/** Safe wrappers around localStorage: they never throw (private mode, blocked storage, bad JSON). */
export const STORAGE_KEYS = {
    auth: "mephub_auth",
    cart: "mephub_cart_v1",
} as const;

export function readJson<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
        }
}

export function writeJson(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // storage full or blocked: the app keeps working in memory
    }
}

export function removeKey(key: string): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(key);
    } catch {
        // ignore
    }
}