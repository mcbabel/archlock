import { describe, expect, it } from "vitest";
import { suggestedVerifyCommands } from "../../src/agents/prompt.js";

describe("suggested verifyCommands", () => {
  it("follow the languages of the project", () => {
    expect(suggestedVerifyCommands(["src/a.ts", "src/b.tsx"])).toEqual(["npx tsc --noEmit"]);
    expect(suggestedVerifyCommands(["src/main.ts", "src/App.vue"])).toEqual([
      "npx vue-tsc --noEmit",
    ]);
    expect(suggestedVerifyCommands(["src/lib/a.ts", "src/routes/+page.svelte"])).toEqual([
      "npx svelte-check",
    ]);
    expect(suggestedVerifyCommands(["src/pages/index.astro", "src/C.svelte"])).toEqual([
      "npx svelte-check",
      "npx astro check",
    ]);
    expect(suggestedVerifyCommands(["web/app.ts", "api/main.py"])).toEqual([
      "npx tsc --noEmit",
      "python -m pytest",
    ]);
    expect(suggestedVerifyCommands(["cmd/shop/main.go", "web/app.ts"])).toEqual([
      "npx tsc --noEmit",
      "go build ./...",
    ]);
    expect(suggestedVerifyCommands(["src/lib.rs", "build.rs"])).toEqual(["cargo check"]);
    expect(suggestedVerifyCommands(["src/main/java/com/acme/App.java"])).toEqual([
      "mvn -q compile",
    ]);
    expect(suggestedVerifyCommands(["src/Shop.Core/Order.cs"])).toEqual(["dotnet build"]);
    expect(suggestedVerifyCommands(["README.md"])).toEqual([]);
  });
});
