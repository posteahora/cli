// Tiny ANSI helpers + printers. No dependencies; honours NO_COLOR / non-TTY.

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (code: string) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);

export const c = {
  bold: wrap("1"),
  dim: wrap("2"),
  green: wrap("32"),
  red: wrap("31"),
  yellow: wrap("33"),
  indigo: wrap("38;5;99"),
};

export const ok = (msg: string) => console.log(`${c.green("✓")} ${msg}`);
export const info = (msg: string) => console.log(msg);
export const warn = (msg: string) => console.error(`${c.yellow("!")} ${msg}`);

export function fail(msg: string): never {
  console.error(`${c.red("✗")} ${msg}`);
  process.exit(1);
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/** Minimal left-aligned table. columns = header row; rows = string cells. */
export function printTable(columns: string[], rows: string[][]): void {
  if (rows.length === 0) {
    console.log(c.dim("(none)"));
    return;
  }
  const widths = columns.map((col, i) =>
    Math.max(col.length, ...rows.map((r) => (r[i] ?? "").length)),
  );
  const line = (cells: string[]) =>
    cells.map((cell, i) => (cell ?? "").padEnd(widths[i])).join("  ");
  console.log(c.dim(line(columns)));
  for (const row of rows) console.log(line(row));
}
