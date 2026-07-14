import type { ParsedArgs } from "../args.js";
import { flag, bool } from "../args.js";
import { ApiClient } from "../api.js";
import { printJson, printTable, info, c } from "../output.js";

interface AnalyticsResponse {
  period: string;
  summary: {
    totals: Record<string, number>;
    byPlatform: Record<string, Record<string, number>>;
  };
  posts: unknown[];
}

const METRICS = ["views", "likes", "comments", "shares", "reach", "saves"] as const;

export async function analytics(args: ParsedArgs): Promise<void> {
  const params = new URLSearchParams();
  params.set("period", flag(args, "period") ?? "30d");
  const platform = flag(args, "platform");
  if (platform) params.set("platform", platform);

  const data = await new ApiClient().get<AnalyticsResponse>(`/analytics?${params}`);

  if (bool(args, "json")) return printJson(data);

  info(c.bold(`Analytics · ${data.period}`));
  const t = data.summary.totals;
  info(METRICS.map((m) => `${m}: ${t[m] ?? 0}`).join("  "));

  const platforms = Object.keys(data.summary.byPlatform);
  if (platforms.length) {
    info("");
    printTable(
      ["PLATFORM", ...METRICS.map((m) => m.toUpperCase())],
      platforms.map((p) => [
        p,
        ...METRICS.map((m) => String(data.summary.byPlatform[p][m] ?? 0)),
      ]),
    );
  }
}
