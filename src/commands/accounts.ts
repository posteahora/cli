import type { ParsedArgs } from "../args.js";
import { bool } from "../args.js";
import { ApiClient } from "../api.js";
import { printJson, printTable } from "../output.js";

interface Account {
  id: string;
  platform: string;
  platform_username?: string | null;
  is_connected?: boolean;
  requires_reauth?: boolean;
}

export async function accounts(args: ParsedArgs): Promise<void> {
  const { accounts } = await new ApiClient().get<{ accounts: Account[] }>("/accounts");

  if (bool(args, "json")) {
    printJson(accounts);
    return;
  }

  printTable(
    ["PLATFORM", "USERNAME", "ACCOUNT ID", "STATUS"],
    accounts.map((a) => [
      a.platform,
      a.platform_username ?? "—",
      a.id,
      a.requires_reauth ? "needs reauth" : a.is_connected === false ? "disconnected" : "connected",
    ]),
  );
}
