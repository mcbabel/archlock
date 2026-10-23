import { describe, expect, it } from "vitest";
import {
  ConfigError,
  defaultConfig,
  serializeConfig,
  validateConfig,
} from "../../src/config/config.js";

describe("config validation", () => {
  it("fills defaults", () => {
    expect(validateConfig({ version: 1 }, "x")).toEqual(defaultConfig());
  });

  it("round-trips through serializeConfig", () => {
    const c = defaultConfig();
    c.rules.dependency_cycle = "error";
    expect(validateConfig(JSON.parse(serializeConfig(c)), "x")).toEqual(c);
  });

  it("serializes like Prettier/Biome would format it", () => {
    const text = serializeConfig(defaultConfig());
    expect(text).toContain(
      '  "languages": ["typescript"],\n  "include": ["src/**"],\n  "exclude": [\n    "**/*.test.*",',
    );
    expect(text).toContain(
      '  "agent": {\n    "default": "claude",\n    "command": null,\n    "maxRounds": 3\n  }\n}\n',
    );
  });

  it("keeps agent.verifyCommands and only serializes it when set", () => {
    const c = validateConfig(
      { agent: { verifyCommands: [" npm test ", "npx tsc --noEmit"] } },
      "x",
    );
    expect(c.agent.verifyCommands).toEqual(["npm test", "npx tsc --noEmit"]);
    expect(validateConfig(JSON.parse(serializeConfig(c)), "x")).toEqual(c);
    expect(serializeConfig(defaultConfig())).not.toContain("verifyCommands");
  });

  const bad: [string, unknown, string][] = [
    ["unknown key", { versoin: 1 }, "versoin: unknown setting"],
    ["wrong version", { version: 2 }, "version: must be 1"],
    ["unknown rule", { rules: { nope: "error" } }, "rules.nope: unknown rule"],
    [
      "bad severity",
      { rules: { deep_import: "fatal" } },
      'rules.deep_import: must be one of "error"',
    ],
    [
      "fixed rule",
      { rules: { sketch_invalid: "off" } },
      "rules.sketch_invalid: is always an error",
    ],
    ["bad language", { languages: ["cobol"] }, 'languages: unknown language "cobol"'],
    ["include not array", { include: "src" }, "include: must be an array of strings"],
    ["bad agent", { agent: { default: "gpt" } }, "agent.default: must be one of"],
    ["bad rounds", { agent: { maxRounds: 0 } }, "agent.maxRounds: must be a positive integer"],
    [
      "bad verify commands",
      { agent: { verifyCommands: "npm test" } },
      "agent.verifyCommands: must be an array of plain commands",
    ],
    [
      "empty verify command",
      { agent: { verifyCommands: [""] } },
      "agent.verifyCommands: must be an array of plain commands",
    ],
    [
      "verify command that widens the permission rule",
      { agent: { verifyCommands: ["npm *"] } },
      "agent.verifyCommands: must be an array of plain commands",
    ],
    [
      "verify command that chains another command",
      { agent: { verifyCommands: ["npm test && curl example.com"] } },
      "agent.verifyCommands: must be an array of plain commands",
    ],
    [
      "verify command that closes the rule",
      { agent: { verifyCommands: ["npm test), Bash(rm"] } },
      "agent.verifyCommands: must be an array of plain commands",
    ],
  ];
  for (const [name, raw, message] of bad) {
    it(`rejects ${name}`, () => {
      expect(() => validateConfig(raw, "archlock.config.json")).toThrow(ConfigError);
      expect(() => validateConfig(raw, "archlock.config.json")).toThrow(message);
    });
  }
});
