#!/usr/bin/env node
import { run } from "./cli/program.js";

// `archlock check | head` closes the pipe early: that is not an error.
for (const stream of [process.stdout, process.stderr]) {
  stream.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EPIPE") process.exit(process.exitCode ?? 0);
    throw error;
  });
}

run(process.argv).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(`archlock: ${String(error)}\n`);
    process.exitCode = 2;
  },
);
