/** An error that remembers the HTTP status of the failed API call. */
export class ApiError extends Error {
  status: number;
  details?: unknown;
  code?: string;

  constructor(message: string, status: number, extra: { details?: unknown; code?: string } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = extra.details;
    this.code = extra.code;
  }
}

/** Turn anything thrown into a message that is safe to show to a user. */
export function errorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof ApiError) {
    const details = error.details;
    // Validation errors look like { email: "Not a valid email address." }
    if (details && typeof details === "object" && !Array.isArray(details)) {
      const first = Object.values(details as Record<string, unknown>).find((v) => typeof v === "string");
      if (typeof first === "string") return first;
    }
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}