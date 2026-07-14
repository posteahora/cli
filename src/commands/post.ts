import type { ParsedArgs } from "../args.js";
import { flag, flagList, bool } from "../args.js";
import { ApiClient } from "../api.js";
import { ok, fail, info, printJson, c } from "../output.js";

interface AccountMapping {
  platform: string;
  accountId: string;
}

// --to accepts repeated flags and/or comma-separated "platform:accountId" pairs.
function parseMappings(args: ParsedArgs): AccountMapping[] {
  const raw = flagList(args, "to").flatMap((v) => v.split(","));
  const mappings: AccountMapping[] = [];
  for (const pair of raw) {
    const [platform, accountId] = pair.split(":");
    if (!platform || !accountId) {
      fail(`Invalid --to "${pair}". Expected platform:accountId (e.g. twitter:a1b2…). Run \`posteahora accounts\`.`);
    }
    mappings.push({ platform: platform.trim(), accountId: accountId.trim() });
  }
  return mappings;
}

export async function post(args: ParsedArgs): Promise<void> {
  const caption = args._[0];
  const mediaUrls = flagList(args, "media");
  const mappings = parseMappings(args);

  if (mappings.length === 0) fail("At least one --to platform:accountId is required.");
  if (!caption && mediaUrls.length === 0) fail("Provide a caption and/or --media <url>.");

  const at = flag(args, "at");
  const draft = bool(args, "draft");

  let status: "draft" | "scheduled" | "published";
  if (draft) status = "draft";
  else if (at) status = "scheduled";
  else status = "published";

  if (at) {
    const when = Date.parse(at);
    if (Number.isNaN(when)) fail("--at must be a valid ISO 8601 timestamp (e.g. 2026-07-20T14:30:00Z).");
    if (when <= Date.now()) fail("--at must be in the future.");
  }

  const hashtags = flag(args, "hashtags")?.split(",").map((h) => h.trim()).filter(Boolean);

  const body: Record<string, unknown> = {
    caption,
    title: flag(args, "title"),
    accountMappings: mappings,
    mediaUrls: mediaUrls.length ? mediaUrls : undefined,
    mediaType: flag(args, "media-type"),
    postType: flag(args, "post-type"),
    hashtags,
    status,
    scheduledAt: at,
  };

  const result = await new ApiClient().post("/posts", body);

  if (bool(args, "json")) {
    printJson(result);
    return;
  }

  const channels = mappings.map((m) => m.platform).join(", ");
  if (status === "published") ok(`Publishing to ${c.bold(channels)} now.`);
  else if (status === "scheduled") ok(`Scheduled for ${c.bold(at!)} on ${c.bold(channels)}.`);
  else ok(`Draft created for ${c.bold(channels)}.`);
  info(c.dim("Check status with `posteahora posts`."));
}
