// Thin fetch wrapper over the PosteAhora public REST API (/v1 contract).
// Every call is authenticated with a `pah_…` key; the gateway enforces auth,
// scopes, quota and ownership.

import { getApiKey, getBaseUrl } from "./config.js";
import { fail } from "./output.js";

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKeyOverride?: string) {
    this.baseUrl = getBaseUrl();
    const key = apiKeyOverride || getApiKey();
    if (!key) {
      fail(
        "No API key. Run `posteahora auth --key pah_live_…`, or set POSTEAHORA_API_KEY.",
      );
    }
    this.apiKey = key;
  }

  async request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      return fail(`Network error: ${e instanceof Error ? e.message : String(e)}`);
    }

    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      const msg =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : `HTTP ${res.status}`;
      return fail(msg);
    }
    return data as T;
  }

  get<T = unknown>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }
  post<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }
  patch<T = unknown>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }
  del<T = unknown>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}
