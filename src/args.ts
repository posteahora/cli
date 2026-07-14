// Zero-dependency argv parser. Supports `--flag value`, `--flag=value`, boolean
// `--flag`, short `-h`, repeatable flags (collected into arrays on read), and
// positional args. Everything after `--` is treated as positional.

export interface ParsedArgs {
  _: string[];
  flags: Record<string, string[] | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const _: string[] = [];
  const flags: Record<string, string[] | boolean> = {};
  let onlyPositional = false;

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (onlyPositional) {
      _.push(token);
      continue;
    }
    if (token === "--") {
      onlyPositional = true;
      continue;
    }
    if (token.startsWith("--")) {
      let name = token.slice(2);
      let value: string | undefined;
      const eq = name.indexOf("=");
      if (eq !== -1) {
        value = name.slice(eq + 1);
        name = name.slice(0, eq);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        value = argv[++i];
      }
      if (value === undefined) {
        flags[name] = true;
      } else {
        const existing = flags[name];
        if (Array.isArray(existing)) existing.push(value);
        else flags[name] = [value];
      }
    } else if (token.startsWith("-") && token.length > 1) {
      // Short boolean flags, e.g. -h, -v.
      for (const ch of token.slice(1)) flags[ch] = true;
    } else {
      _.push(token);
    }
  }

  return { _, flags };
}

/** First value of a (possibly repeated) flag, or undefined. */
export function flag(args: ParsedArgs, name: string, short?: string): string | undefined {
  const v = args.flags[name] ?? (short ? args.flags[short] : undefined);
  return Array.isArray(v) ? v[0] : undefined;
}

/** All values of a repeatable flag. */
export function flagList(args: ParsedArgs, name: string): string[] {
  const v = args.flags[name];
  return Array.isArray(v) ? v : [];
}

/** Presence of a boolean flag. */
export function bool(args: ParsedArgs, name: string, short?: string): boolean {
  return args.flags[name] === true || (short ? args.flags[short] === true : false);
}
