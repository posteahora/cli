import type { ParsedArgs } from "../args.js";
import { flag, bool } from "../args.js";
import { ApiClient } from "../api.js";
import { ok, printJson, printTable, fail } from "../output.js";

interface Idea {
  id: string;
  title?: string | null;
  caption?: string | null;
  status?: string;
  tags?: string[];
}

export async function ideas(args: ParsedArgs): Promise<void> {
  const sub = args._[0] ?? "list";
  const api = new ApiClient();

  if (sub === "add") {
    const title = args._[1] ?? flag(args, "title");
    const caption = flag(args, "caption");
    if (!title && !caption) fail("Provide a title (posteahora ideas add \"My idea\") or --caption.");
    const tags = flag(args, "tags")?.split(",").map((t) => t.trim()).filter(Boolean);
    const status = flag(args, "status");
    const { idea } = await api.post<{ idea: Idea }>("/ideas", { title, caption, tags, status });
    ok(`Idea created${idea.title ? `: ${idea.title}` : ""}.`);
    return;
  }

  if (sub === "list") {
    const { ideas } = await api.get<{ ideas: Idea[] }>("/ideas");
    if (bool(args, "json")) return printJson(ideas);
    printTable(
      ["ID", "STATUS", "TITLE", "TAGS"],
      ideas.map((i) => [
        i.id.slice(0, 8),
        i.status ?? "—",
        i.title ?? "—",
        (i.tags ?? []).join(",") || "—",
      ]),
    );
    return;
  }

  fail(`Unknown ideas subcommand "${sub}". Use: list | add.`);
}
