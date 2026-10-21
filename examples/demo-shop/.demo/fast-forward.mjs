// Passes stdin through; when output resumes after more than 10 s of silence, prints a marker
// such as "⏩ 83s", and the total at the end. demo.tape hides the frames until the marker.
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
