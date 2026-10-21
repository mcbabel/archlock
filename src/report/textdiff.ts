/** Line diff (Myers' O(ND) algorithm) and a unified-diff renderer for sketch previews. */

import type { Colors } from "./format.js";

export type DiffOp = { op: "=" | "-" | "+"; line: string };

export function diffLines(a: string[], b: string[]): DiffOp[] {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const v = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];
  outer: for (let d = 0; d <= max; d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      const down = k === -d || (k !== d && (v.get(k - 1) ?? -1) < (v.get(k + 1) ?? -1));
      let x = down ? (v.get(k + 1) ?? 0) : (v.get(k - 1) ?? 0) + 1;
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v.set(k, x);
      if (x >= n && y >= m) break outer;
    }
  }
  // Backtrack.
  const ops: DiffOp[] = [];
  let x = n;
  let y = m;
  for (let d = trace.length - 1; d >= 0; d--) {
    const vd = trace[d] as Map<number, number>;
    const k = x - y;
    const down = k === -d || (k !== d && (vd.get(k - 1) ?? -1) < (vd.get(k + 1) ?? -1));
    const prevK = down ? k + 1 : k - 1;
    const prevX = vd.get(prevK) ?? 0;
    const prevY = prevX - prevK;
    while (x > prevX && y > prevY) {
      ops.push({ op: "=", line: a[x - 1] as string });
      x--;
      y--;
    }
    if (d > 0) {
      if (down) ops.push({ op: "+", line: b[y - 1] as string });
      else ops.push({ op: "-", line: a[x - 1] as string });
    }
    x = prevX;
    y = prevY;
  }
  return ops.reverse();
}

/** A unified diff with `context` lines around changes; empty string when equal. */
export function unifiedDiff(
  oldText: string,
  newText: string,
  file: string,
  c: Colors,
  context = 2,
): string {
  if (oldText === newText) return "";
  const ops = diffLines(oldText.split("\n"), newText.split("\n"));
  const changed = ops.map((o) => o.op !== "=");
  const show = ops.map((_, i) => {
    for (let j = Math.max(0, i - context); j <= Math.min(ops.length - 1, i + context); j++) {
      if (changed[j]) return true;
    }
    return false;
  });
  const lines = [c.bold(`--- ${file}`), c.bold(`+++ ${file}`)];
  let newLine = 1;
  let inHunk = false;
  ops.forEach((o, i) => {
    if (show[i]) {
      if (!inHunk) lines.push(c.cyan(`@@ line ${newLine} @@`));
      inHunk = true;
      if (o.op === "=") lines.push(` ${o.line}`);
      else if (o.op === "-") lines.push(c.red(`-${o.line}`));
      else lines.push(c.green(`+${o.line}`));
    } else inHunk = false;
    if (o.op !== "-") newLine++;
  });
  return `${lines.join("\n")}\n`;
}
