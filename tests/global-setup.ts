import { mkdirSync, writeFileSync } from "node:fs";
import type { FullConfig } from "@playwright/test";

interface LoginResponse {
  token: string;
  user: unknown;
}

async function saveSession(origin: string, apiUrl: string, email: string, password: string, file: string) {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error(`Cannot reach the backend at ${apiUrl}. Start the Flask API first (see README).`);
  }
  if (!response.ok) {
    throw new Error(
      `Login as ${email} failed (${response.status}). Run the backend seeder and check E2E_* values in .env.local.`,
    );
  }
  const { token, user } = (await response.json()) as LoginResponse;
  // This is exactly what AuthContext keeps in localStorage, so tests start already logged in.
  const state = {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [{ name: "mephub_auth", value: JSON.stringify({ token, user }) }],
      },
    ],
  };
  writeFileSync(file, JSON.stringify(state, null, 2));
}

export default async function globalSetup(config: FullConfig) {
  const apiUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
  const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000";
  const credentials = {
    adminEmail: process.env.E2E_ADMIN_EMAIL,
    adminPassword: process.env.E2E_ADMIN_PASSWORD,
    userEmail: process.env.E2E_USER_EMAIL,
    userPassword: process.env.E2E_USER_PASSWORD,
  };
  if (!apiUrl || Object.values(credentials).some((value) => !value)) {
    throw new Error("Set NEXT_PUBLIC_API_BASE_URL and E2E_ADMIN_/E2E_USER_ EMAIL and PASSWORD in .env.local (see .env.example).");
  }

  mkdirSync("playwright/.auth", { recursive: true });
  await saveSession(baseURL, apiUrl, credentials.adminEmail!, credentials.adminPassword!, "playwright/.auth/admin.json");
  await saveSession(baseURL, apiUrl, credentials.userEmail!, credentials.userPassword!, "playwright/.auth/user.json");
}