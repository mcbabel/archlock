import { describe, expect, it } from "vitest";
import { run } from "../src/cli/program.js";

function capture() {
  let out = "";
  let err = "";
  return {
    io: {
      stdout: (t: string) => {
        out += t;
      },
      stderr: (t: string) => {
        err += t;
      },
    },
    get out() {
      return out;
    },
    get err() {
      return err;
    },
  };
}

describe("run()", () => {
  it("returns 0 for --version and writes it to stdout", async () => {
    const c = capture();
    expect(await run(["node", "archlock", "--version"], c.io)).toBe(0);
    expect(c.out).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("returns a non-zero code for unknown options", async () => {
    const c = capture();
    expect(await run(["node", "archlock", "--nope"], c.io)).not.toBe(0);
    expect(c.err).toContain("unknown option");
  });
});
