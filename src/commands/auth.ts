import type { ParsedArgs } from "../args.js";
import { flag, bool } from "../args.js";
import { ApiClient } from "../api.js";
import { saveApiKey, clearApiKey, getApiKey, keySource } from "../config.js";
import { ok, info, fail, c } from "../output.js";

const mask = (key: string) => `${key.slice(0, 12)}…${key.slice(-4)}`;

export async function auth(args: ParsedArgs): Promise<void> {
  if (bool(args, "logout")) {
    clearApiKey();
    ok("Logged out — saved key removed.");
    return;
  }

  const key = flag(args, "key") || args._[0];

  // No key given → show current status.
  if (!key) {
    const current = getApiKey();
    if (!current) {
      info("Not authenticated. Run `posteahora auth --key pah_live_…`.");
      return;
    }
    // Validate the stored/env key against the API.
    await new ApiClient(current).get("/accounts");
    ok(`Authenticated (${mask(current)}, from ${keySource()}).`);
    return;
  }

  if (!/^pah_(live|test)_/.test(key)) {
    fail("That doesn't look like a PosteAhora key (expected pah_live_… or pah_test_…).");
  }

  // Validate before persisting.
  await new ApiClient(key).get("/accounts");
  saveApiKey(key);
  ok(`Saved key ${mask(key)} to ${c.dim("~/.posteahora/config.json")}.`);
}
