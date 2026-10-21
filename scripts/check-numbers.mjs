// Fails when the key numbers in README.md, the site and examples/real-world disagree with
// examples/real-world/numbers.json and package.json (version).
// Missing launch/ and docs/ folders are skipped.
// Usage: node scripts/check-numbers.mjs
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/** Same formatting as src/report/format.ts. */
export function formatNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatRatio(codeLines, sketchLines) {
  const r = sketchLines === 0 ? 0 : codeLines / sketchLines;
  return `${r >= 10 ? formatNumber(r) : r.toFixed(1)}×`;
}

const REQUIRED = ["README.md", "site/index.html", "examples/real-world/README.md"];

function files(root) {
  const list = [...REQUIRED];
  for (const dir of ["launch", "docs"]) {
    if (!existsSync(join(root, dir))) continue;
    for (const f of readdirSync(join(root, dir))) if (f.endsWith(".md")) list.push(`${dir}/${f}`);
  }
  return list.filter((f) => existsSync(join(root, f)));
}

/** Returns a list of problems; empty when everything agrees. */
export function checkNumbers(root) {
  const problems = [];
  const numbers = JSON.parse(readFileSync(join(root, "examples/real-world/numbers.json"), "utf8"));
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;

  for (const file of files(root)) {
    const text = readFileSync(join(root, file), "utf8");
    for (const [name, n] of Object.entries(numbers)) {
      const code = formatNumber(n.codeLines);
      const sketch = formatNumber(n.sketchLines);
      const ratio = formatRatio(n.codeLines, n.sketchLines);
      let found = 0;
      for (let i = text.indexOf(code); i !== -1; i = text.indexOf(code, i + 1)) {
        found++;
        const window = text.slice(i, i + 160);
        if (!window.includes(sketch)) {
          problems.push(
            `${file}: ${name} has ${code} lines of code but not ${sketch} lines of architecture next to it`,
          );
        } else if (
          /×/.test(window.slice(0, window.indexOf(sketch) + 60)) &&
          !window.includes(ratio)
        ) {
          problems.push(`${file}: ${name} should have the ratio ${ratio}`);
        }
      }
      if (REQUIRED.includes(file) && found === 0) {
        problems.push(
          `${file}: the numbers for ${name} (${code} → ${sketch}, ${ratio}) are missing`,
        );
      }
    }
    for (const m of text.matchAll(/\barchlock@(\d+\.\d+\.\d+)\b/g)) {
      if (m[1] !== version)
        problems.push(`${file}: mentions archlock@${m[1]}, package.json says ${version}`);
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
  const problems = checkNumbers(root);
  for (const p of problems) console.error(`✖ ${p}`);
  if (problems.length > 0) {
    console.error("Update the files above, or regenerate examples/real-world/numbers.json.");
    process.exit(1);
  }
  console.log(`✔ numbers agree in ${files(root).length} files (${files(root).join(", ")})`);
}
