import { afterAll, describe, expect, it } from "vitest";
import { parsePnpmWorkspace } from "../../src/extract/workspaces.js";
import { detectModules, moduleName } from "../../src/init/detect.js";
import { cleanupFixtures, copyFixture } from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

describe("module detection", () => {
  it("uses workspace packages in a monorepo", () => {
    const d = detectModules(copyFixture("ts-monorepo"), ["typescript"]);
    expect(d.strategy).toBe("workspaces");
    expect(d.modules).toEqual([
      { name: "db", paths: ["packages/db/**"], entry: "packages/db/src/index.ts" },
      { name: "ui", paths: ["packages/ui/**"], entry: "packages/ui/src/index.ts" },
      { name: "web", paths: ["apps/web/**"], entry: null },
    ]);
    expect(d.include).toEqual(["apps/**", "packages/**"]);
  });

  it("uses src/ subdirectories plus a module for loose files", () => {
    const d = detectModules(copyFixture("ts-single"), ["typescript"]);
    expect(d.strategy).toBe("src");
    expect(d.modules.map((m) => [m.name, m.paths[0], m.entry])).toEqual([
      ["billing", "src/billing/**", "src/billing/index.ts"],
      ["db", "src/db/**", "src/db/index.ts"],
      ["events", "src/events/**", "src/events/index.ts"],
      ["shop", "src/*", null],
    ]);
  });

  it("turns package names into module names", () => {
    expect(moduleName("@acme/ui-kit")).toBe("ui_kit");
    expect(moduleName("3d")).toBe("m_3d");
  });

  it("reads pnpm-workspace.yaml", () => {
    expect(
      parsePnpmWorkspace("packages:\n  - 'packages/*'\n  - \"apps/*\" # apps\nother: 1\n"),
    ).toEqual(["packages/*", "apps/*"]);
    expect(parsePnpmWorkspace("packages: [a/*, 'b/*']\n")).toEqual(["a/*", "b/*"]);
  });
});

describe("Python module detection", () => {
  it("uses the subpackages of a src-layout package", () => {
    const d = detectModules(copyFixture("py-src"), ["python"]);
    expect(d.strategy).toBe("python-package");
    expect(d.modules.map((m) => [m.name, m.paths[0]])).toEqual([
      ["billing", "src/shopkit/billing/**"],
      ["db", "src/shopkit/db/**"],
      ["events", "src/shopkit/events/**"],
      ["shopkit", "src/shopkit/*"],
    ]);
    expect(d.include).toEqual(["src/shopkit/**"]);
  });

  it("uses the subpackages of a flat-layout package", () => {
    const d = detectModules(copyFixture("py-flat"), ["python"]);
    expect(d.modules.map((m) => m.name)).toEqual(["acme", "api", "core"]);
  });

  it("uses top-level directories in a mixed repository", () => {
    const d = detectModules(copyFixture("mixed"), ["typescript", "python"]);
    expect(d.strategy).toBe("top-level");
    expect(d.modules.map((m) => [m.name, m.paths[0]])).toEqual([
      ["api", "api/**"],
      ["web", "web/**"],
    ]);
  });
});

describe("workspaces with code in the root package", () => {
  it("adds modules for the root src/ next to the workspace packages", async () => {
    const { mkdtempSync, mkdirSync, writeFileSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "archlock-wsroot-"));
    const file = (p: string, text: string) => {
      mkdirSync(join(dir, p, ".."), { recursive: true });
      writeFileSync(join(dir, p), text);
    };
    file("package.json", '{ "name": "framework", "workspaces": ["adapters/*"] }');
    file("adapters/node/package.json", '{ "name": "@framework/node" }');
    file("adapters/node/src/index.ts", "export const serve = 1;\n");
    file("src/router/index.ts", "export const route = 1;\n");
    file("src/app.ts", "export const app = 1;\n");
    const d = detectModules(dir, ["typescript"]);
    expect(d.strategy).toBe("workspaces");
    expect(d.modules.map((m) => [m.name, m.paths[0]])).toEqual([
      ["framework", "src/*"],
      ["node", "adapters/node/**"],
      ["router", "src/router/**"],
    ]);
    expect(d.include).toEqual(["adapters/**", "src/**"]);
  });

  it("Java: one module per source root; test modules and long package Javadocs are handled", () => {
    const d = detectModules(copyFixture("java-multi"), ["java"]);
    expect(d.strategy).toBe("java-packages");
    expect(d.modules).toEqual([
      { name: "app", paths: ["app/src/main/java/**"], entry: null },
      { name: "core", paths: ["core/src/main/java/**"], entry: null },
    ]);
  });

  it("Java: a single source root is split into the subpackages of its root package", () => {
    const d = detectModules(copyFixture("java-app"), ["java"]);
    expect(d.modules.map((m) => [m.name, m.paths])).toEqual([
      ["billing", ["src/main/java/com/acme/shop/billing/**"]],
      ["order", ["src/main/java/com/acme/shop/order/**"]],
      ["shop", ["src/main/java/com/acme/shop/*.java"]],
    ]);
    expect(d.include).toEqual(["src/main/java/**"]);
  });

  it("C#: one module per project; test projects, shared folders and web assets", () => {
    const d = detectModules(copyFixture("csharp-app"), ["csharp", "typescript"]);
    expect(d.strategy).toBe("csharp-projects");
    expect(d.modules.map((m) => [m.name, m.paths])).toEqual([
      ["Shared", ["src/Shared/**"]],
      ["Shop.Api", ["src/Shop.Api/**"]],
      ["Shop.Core", ["src/Shop.Core/**"]],
    ]);
  });

  it("C#: a single project is split into its folders; Properties/ belongs to the project", () => {
    const d = detectModules(copyFixture("csharp-single"), ["csharp"]);
    expect(d.modules.map((m) => [m.name, m.paths])).toEqual([
      ["Cart", ["Cart/**"]],
      ["Catalog", ["Catalog/**"]],
      ["Store", ["*.cs", "Properties/**"]],
    ]);
  });
});
