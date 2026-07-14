#!/usr/bin/env node
// PosteAhora CLI — schedule and publish social posts from the terminal.
// A thin wrapper over the PosteAhora public REST API.

import { parseArgs } from "./args.js";
import { fail, c } from "./output.js";
import { auth } from "./commands/auth.js";
import { accounts } from "./commands/accounts.js";
import { post } from "./commands/post.js";
import { posts } from "./commands/posts.js";
import { ideas } from "./commands/ideas.js";
import { analytics } from "./commands/analytics.js";
import { upload } from "./commands/upload.js";

const VERSION = "0.1.0";

const HELP = `${c.bold("posteahora")} — schedule & publish social posts from the terminal

${c.bold("USAGE")}
  posteahora <command> [options]

${c.bold("COMMANDS")}
  auth --key <pah_…>          Save & validate your API key
  auth                        Show current auth status
  logout                      Remove the saved key
  accounts                    List connected social accounts (get their IDs)
  post "<caption>" --to …     Publish now, schedule, or draft a post
  posts [--status s]          List your posts
  ideas list | add "<title>"  Read or add backlog ideas
  analytics [--period 30d]    Show performance across platforms
  upload <file>               Upload media, get a public URL for --media

${c.bold("POST OPTIONS")}
  --to platform:accountId     Target channel (repeatable or comma-separated)
  --media <url>               Attach media (repeatable; use \`upload\` to get a URL)
  --at <ISO 8601>             Schedule for a future time (else publishes now)
  --draft                     Create a draft instead of publishing
  --title, --hashtags a,b, --media-type image|video, --post-type post|reel|story

${c.bold("EXAMPLES")}
  posteahora auth --key pah_live_xxxx
  posteahora accounts
  posteahora post "Launch day 🚀" --to twitter:a1b2 --to linkedin:c3d4
  posteahora post "New reel" --to instagram:e5f6 --media https://… --at 2026-07-20T09:00:00Z
  posteahora analytics --period 7d

${c.bold("CONFIG")}
  API key:  --key  >  POSTEAHORA_API_KEY  >  ~/.posteahora/config.json
  Base URL: POSTEAHORA_API_URL (default https://api.posteahora.com/functions/v1/api)

Docs: https://posteahora.com/docs`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const rest = parseArgs(argv.slice(1));

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log(HELP);
    return;
  }
  if (cmd === "version" || cmd === "--version" || cmd === "-v") {
    console.log(VERSION);
    return;
  }

  switch (cmd) {
    case "auth":
      return auth(rest);
    case "logout":
      return auth(parseArgs(["--logout"]));
    case "accounts":
      return accounts(rest);
    case "post":
      return post(rest);
    case "posts":
      return posts(rest);
    case "ideas":
      return ideas(rest);
    case "analytics":
      return analytics(rest);
    case "upload":
      return upload(rest);
    default:
      fail(`Unknown command "${cmd}". Run \`posteahora help\`.`);
  }
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
