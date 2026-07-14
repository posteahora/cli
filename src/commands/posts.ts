import type { ParsedArgs } from "../args.js";
import { flag, bool } from "../args.js";
import { ApiClient } from "../api.js";
import { printJson, printTable } from "../output.js";

interface Post {
  id: string;
  caption?: string | null;
  platforms?: string[];
  status?: string;
  scheduled_at?: string | null;
  published_at?: string | null;
}

const snippet = (s?: string | null) =>
  !s ? "—" : s.length > 40 ? s.slice(0, 39) + "…" : s;

export async function posts(args: ParsedArgs): Promise<void> {
  const params = new URLSearchParams();
  const status = flag(args, "status");
  const limit = flag(args, "limit");
  if (status) params.set("status", status);
  if (limit) params.set("limit", limit);
  const qs = params.toString() ? `?${params}` : "";

  const res = await new ApiClient().get<{ posts: Post[] }>(`/posts${qs}`);

  if (bool(args, "json")) {
    printJson(res.posts);
    return;
  }

  printTable(
    ["ID", "STATUS", "PLATFORMS", "WHEN", "CAPTION"],
    res.posts.map((p) => [
      p.id.slice(0, 8),
      p.status ?? "—",
      (p.platforms ?? []).join(",") || "—",
      p.published_at ?? p.scheduled_at ?? "—",
      snippet(p.caption),
    ]),
  );
}
