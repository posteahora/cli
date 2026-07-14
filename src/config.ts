// API key + base URL resolution. Key precedence: --key flag (handled by caller)
// > POSTEAHORA_API_KEY env > ~/.posteahora/config.json.

import { homedir } from "node:os";
import { join } from "node:path";
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";

const DEFAULT_BASE_URL = "https://api.posteahora.com/functions/v1/api";

const CONFIG_DIR = join(homedir(), ".posteahora");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface StoredConfig {
  apiKey?: string;
}

function read(): StoredConfig {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as StoredConfig;
  } catch {
    return {};
  }
}

export function getApiKey(): string | undefined {
  return process.env.POSTEAHORA_API_KEY || read().apiKey;
}

export function getBaseUrl(): string {
  return (process.env.POSTEAHORA_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

export function saveApiKey(apiKey: string): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey }, null, 2) + "\n", { mode: 0o600 });
}

export function clearApiKey(): void {
  if (existsSync(CONFIG_FILE)) rmSync(CONFIG_FILE);
}

/** Where the key currently comes from (for `auth` status output). */
export function keySource(): "env" | "config" | "none" {
  if (process.env.POSTEAHORA_API_KEY) return "env";
  if (read().apiKey) return "config";
  return "none";
}

export { CONFIG_FILE };
