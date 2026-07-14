# @posteahora/cli

Command-line tool for [PosteAhora](https://posteahora.com) — schedule and publish
social posts across Instagram, X/Twitter, LinkedIn, Threads, Facebook, TikTok and
more, straight from your terminal or CI.

A thin, zero-dependency wrapper over the PosteAhora public REST API.

## Install

```bash
npm i -g @posteahora/cli
# or run without installing:
npx @posteahora/cli --help
```

The command is `posteahora`.

## Get an API key

1. Open PosteAhora → **Settings → API & integrations**.
2. Create a key and copy it (shown once) — it looks like `pah_live_…`.

```bash
posteahora auth --key pah_live_xxxxxxxx
```

The key is validated and saved to `~/.posteahora/config.json`. You can also pass it
per-run via the `POSTEAHORA_API_KEY` environment variable (handy in CI).

## Usage

```bash
# List connected accounts (you need their IDs to post)
posteahora accounts

# Publish now to multiple channels
posteahora post "Launch day 🚀" --to twitter:a1b2 --to linkedin:c3d4

# Schedule a post with media
posteahora upload ./reel.mp4                 # → prints a public URL
posteahora post "New reel" --to instagram:e5f6 \
  --media https://cdn.posteahora.com/… --at 2026-07-20T09:00:00Z

# Draft only
posteahora post "Rough idea" --to twitter:a1b2 --draft

# Ideas backlog
posteahora ideas add "5 hooks for launch week" --tags launch,eng
posteahora ideas list

# Analytics
posteahora analytics --period 30d
```

Add `--json` to most commands for machine-readable output.

## Commands

| Command | Description |
|---------|-------------|
| `auth --key <pah_…>` | Save & validate your API key |
| `accounts` | List connected social accounts |
| `post "<caption>" --to platform:id` | Publish now, schedule (`--at`), or draft (`--draft`) |
| `posts [--status s]` | List your posts |
| `ideas list \| add "<title>"` | Read or add backlog ideas |
| `analytics [--period 7d\|30d\|90d\|all]` | Performance across platforms |
| `upload <file>` | Upload media, get a public URL |

## Configuration

- **API key:** `--key` flag → `POSTEAHORA_API_KEY` → `~/.posteahora/config.json`
- **Base URL:** `POSTEAHORA_API_URL` (default `https://api.posteahora.com/functions/v1/api`)

## Prefer an AI agent or the raw API?

- MCP server: [`@posteahora/mcp`](https://github.com/posteahora/mcp)
- REST API reference: [posteahora.com/docs/api](https://posteahora.com/docs/api)

## License

MIT
