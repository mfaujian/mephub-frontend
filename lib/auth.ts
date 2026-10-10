import "server-only";
import { unstable_rethrow } from "next/navigation";
import { getApiBaseUrl } from "@/lib/config";
import { ApiError } from "@/lib/errors";
import type { LoginResponse } from "@/types";

const TOKEN_LIFETIME_MS = 50 * 60 * 1000;

let cachedToken: { value: string; expiresAt: number } | null = null;

export function clearDemoToken(): void {
  cachedToken = null;
}

export async function getDemoToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const email = process.env.API_DEMO_EMAIL;
  const password = process.env.API_DEMO_PASSWORD;
  if (!email || !password) {
    throw new ApiError("API_DEMO_EMAIL and API_DEMO_PASSWORD must be set in .env.local", 500);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch (error) {
    unstable_rethrow(error);
    throw new ApiError("Could not reach the RevoShop API", 0);
  }

  if (!response.ok) {
    throw new ApiError(`Demo login failed (${response.status})`, response.status);
  }

  const data = (await response.json()) as LoginResponse;
  cachedToken = { value: data.token, expiresAt: Date.now() + TOKEN_LIFETIME_MS };
  return data.token;
}
