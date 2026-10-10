/** Base URL of the Flask API, from .env.local. Throws a clear error if it is missing. */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  return url.replace(/\/+$/, "");
}
