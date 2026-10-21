// Passes its input through unchanged and marks long silences: when output resumes after more
// than 10 seconds, it first prints "⏩ 83s", and at the end the total time it marked.
// demo.tape hides the frames while the real agent works and shows them again at the marker, so
// the GIF is shorter but says on screen how much waiting it skipped.
const GAP_MS = 10_000;
const mark = (text) => process.stdout.write(`\x1b[1;35m⏩ ${text}\x1b[0m\n`);
let last = Date.now();
let skipped = 0;
process.stdin.on("data", (chunk) => {
  const gap = Date.now() - last;
  if (gap > GAP_MS) {
    skipped += gap;
    process.stdout.write("\n");
    mark(`${Math.round(gap / 1000)}s`);
    process.stdout.write("\n");
  }
  last = Date.now();
  process.stdout.write(chunk);
});
process.stdin.on("end", () => {
  if (skipped > 0) mark(`${Math.round(skipped / 1000)}s of waiting for the agent are sped up in this GIF`);
});
