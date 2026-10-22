import { afterAll, describe, expect, it } from "vitest";
import {
  archlock,
  checkJson,
  cleanupFixtures,
  copyFixture,
  edit,
  write,
} from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

interface Expected {
  rule: string;
  module: string | null;
  symbol?: string;
}

interface Mutation {
  name: string;
  apply: (dir: string) => void;
  expected: Expected[];
}

const mutations: Mutation[] = [
  {
    name: "new import of another module",
    apply: (d) =>
      edit(d, "src/db/types.ts", /^/, 'import { emit } from "../events";\nemit("x");\n'),
    expected: [{ rule: "undeclared_dependency", module: "db" }],
  },
  {
    name: "dependency no longer used",
    apply: (d) => {
      edit(d, "src/billing/payments.ts", 'import { emit } from "../events";\n', "");
      edit(d, "src/billing/payments.ts", '  emit("invoice.paid", { id });\n', "");
    },
    expected: [{ rule: "unused_dependency", module: "billing" }],
  },
  {
    name: "new public function",
    apply: (d) =>
      edit(
        d,
        "src/billing/invoice.ts",
        /$/,
        "\nexport function voidInvoice(id: string): void {}\n",
      ),
    expected: [{ rule: "public_symbol_added", module: "billing", symbol: "voidInvoice" }],
  },
  {
    name: "planned symbol in the sketch",
    apply: (d) => edit(d, "archlock/billing.arch.py", /$/, "def refund(id: string) -> void: ...\n"),
    expected: [{ rule: "planned_not_implemented", module: "billing", symbol: "refund" }],
  },
  {
    name: "changed parameter",
    apply: (d) =>
      edit(d, "src/billing/invoice.ts", "customer: CustomerId, lines", "customer: string, lines"),
    expected: [{ rule: "signature_changed", module: "billing", symbol: "createInvoice" }],
  },
  {
    name: "changed return type",
    apply: (d) =>
      edit(d, "src/events/index.ts", "payload?: unknown): void", "payload?: unknown): boolean"),
    expected: [{ rule: "signature_changed", module: "events", symbol: "emit" }],
  },
  {
    name: "new class member",
    apply: (d) =>
      edit(
        d,
        "src/db/database.ts",
        "  static instances = 0;",
        "  static instances = 0;\n  close(): void {}",
      ),
    expected: [{ rule: "signature_changed", module: "db", symbol: "Database" }],
  },
  {
    name: "new enum member",
    apply: (d) =>
      edit(d, "src/billing/invoice.ts", '  Paid = "paid",', '  Paid = "paid",\n  Void = "void",'),
    expected: [{ rule: "signature_changed", module: "billing", symbol: "InvoiceStatus" }],
  },
  {
    name: "type alias became an interface",
    apply: (d) =>
      edit(
        d,
        "src/billing/invoice.ts",
        "export type CustomerId = string;",
        "export interface CustomerId { id: string }",
      ),
    expected: [{ rule: "kind_changed", module: "billing", symbol: "CustomerId" }],
  },
  {
    name: "deep import of a non-public symbol",
    apply: (d) =>
      edit(
        d,
        "src/billing/payments.ts",
        /^/,
        'import { connectRaw } from "../db/internal";\nconnectRaw("x");\n',
      ),
    expected: [{ rule: "deep_import", module: "billing" }],
  },
  {
    name: "file outside every module",
    apply: (d) => {
      write(d, "src/orphan.ts", "export const x = 1;\n");
      // src/* belongs to the root module; a new directory does not.
      edit(d, "archlock/shop.arch.py", '__paths__ = ["src/*"]', '__paths__ = ["src/main.ts"]');
    },
    expected: [{ rule: "unassigned_file", module: null }],
  },
  {
    name: "external package not in __external__",
    apply: (d) => {
      edit(
        d,
        "archlock/db.arch.py",
        "__depends_on__ = []",
        "__depends_on__ = []\n__external__ = []",
      );
      edit(d, "src/db/internal.ts", /^/, 'import pg from "pg";\nexport const driver = pg;\n');
    },
    expected: [{ rule: "undeclared_external", module: "db" }],
  },
  {
    name: "builtin modules are never external",
    apply: (d) => {
      edit(
        d,
        "archlock/db.arch.py",
        "__depends_on__ = []",
        "__depends_on__ = []\n__external__ = []",
      );
      edit(
        d,
        "src/db/internal.ts",
        /^/,
        'import { readFileSync } from "node:fs";\nimport path from "path";\nreadFileSync(path.sep);\n',
      );
    },
    expected: [],
  },
  {
    name: "dependency cycle (when enabled)",
    apply: (d) => {
      edit(d, "archlock.config.json", '"dependency_cycle": "off"', '"dependency_cycle": "error"');
      edit(d, "archlock/events.arch.py", "__depends_on__ = []", '__depends_on__ = ["billing"]');
      edit(
        d,
        "src/events/index.ts",
        /^/,
        'import type { Invoice } from "../billing";\nexport type Paid = Invoice;\n',
      );
      edit(d, "archlock/events.arch.py", /$/, "\nPaid: TypeAlias = Invoice\n");
    },
    expected: [{ rule: "dependency_cycle", module: "billing" }],
  },
  {
    name: "broken sketch",
    apply: (d) => edit(d, "archlock/events.arch.py", "def emit(", "def emit(("),
    expected: [{ rule: "sketch_invalid", module: "events" }],
  },
  {
    name: "comments and docstrings never fail the check",
    apply: (d) => {
      edit(d, "archlock/billing.arch.py", /^/, '"""Billing: invoices and payments."""\n\n');
      edit(
        d,
        "archlock/billing.arch.py",
        "def createInvoice(",
        "# invariant: total is never negative\ndef createInvoice(",
      );
    },
    expected: [],
  },
];

describe("targeted changes produce exactly the expected violation (ts-single)", () => {
  for (const m of mutations) {
    it(m.name, async () => {
      const dir = copyFixture("ts-single");
      expect((await archlock(dir, "init", "--yes")).code).toBe(0);
      m.apply(dir);
      const result = await checkJson(dir);
      const got = result.violations.map((v) => ({
        rule: v.rule,
        module: v.module,
        ...(v.symbol ? { symbol: v.symbol } : {}),
      }));
      const expected = m.expected.map((e) => ({ ...e }));
      expect(got).toEqual(expected);
      const errors = result.violations.filter((v) => v.severity === "error").length;
      expect(result.code).toBe(errors > 0 ? 1 : 0);
    });
  }
});

interface ComponentMutation extends Mutation {
  fixture: "vue-app" | "svelte-app" | "astro-site" | "nuxt-app";
}

const componentMutations: ComponentMutation[] = [
  {
    name: "Vue: a new prop changes the component's signature",
    fixture: "vue-app",
    apply: (d) =>
      edit(d, "src/components/UserCard.vue", "  user: User;", "  user: User;\n  avatar?: string;"),
    expected: [{ rule: "signature_changed", module: "components", symbol: "UserCard" }],
  },
  {
    name: "Vue: a removed event changes the component's signature",
    fixture: "vue-app",
    apply: (d) => edit(d, "src/components/UserCard.vue", '  (e: "close"): void;\n', ""),
    expected: [{ rule: "signature_changed", module: "components", symbol: "UserCard" }],
  },
  {
    name: "Vue: a component importing another module is a new dependency",
    fixture: "vue-app",
    apply: (d) =>
      edit(
        d,
        "src/stores/users.ts",
        /^/,
        'import BaseButton from "@/components/BaseButton.vue";\nvoid BaseButton;\n',
      ),
    expected: [{ rule: "undeclared_dependency", module: "stores" }],
  },
  {
    name: "Nuxt: an import through the ~ alias is a dependency",
    fixture: "nuxt-app",
    apply: (d) =>
      edit(
        d,
        "utils/format.ts",
        /^/,
        'import { useCart } from "~/composables/useCart";\nvoid useCart;\n',
      ),
    expected: [{ rule: "undeclared_dependency", module: "utils" }],
  },
  {
    name: "Vue: a new component file is a new public symbol",
    fixture: "vue-app",
    apply: (d) => write(d, "src/components/Avatar.vue", "<template><img /></template>\n"),
    expected: [{ rule: "public_symbol_added", module: "components", symbol: "Avatar" }],
  },
  {
    name: "Svelte: a new $props() field changes the component's signature",
    fixture: "svelte-app",
    apply: (d) =>
      edit(
        d,
        "src/lib/components/Counter.svelte",
        "    start?: number;",
        "    start?: number;\n    step: number;",
      ),
    expected: [
      { rule: "signature_changed", module: "lib", symbol: "Counter" },
      { rule: "deep_import", module: "routes" },
    ],
  },
  {
    name: "Svelte: a new `export let` prop changes the component's signature",
    fixture: "svelte-app",
    apply: (d) =>
      edit(
        d,
        "src/lib/components/Legacy.svelte",
        "  export let count = 0;",
        "  export let count = 0;\n  export let open: boolean;",
      ),
    expected: [
      { rule: "signature_changed", module: "lib", symbol: "Legacy" },
      { rule: "deep_import", module: "routes" },
    ],
  },
  {
    name: "Astro: a new Props member changes the component's signature",
    fixture: "astro-site",
    apply: (d) =>
      edit(
        d,
        "src/components/Card.astro",
        "  href?: string;",
        "  href?: string;\n  image: string;",
      ),
    expected: [{ rule: "signature_changed", module: "components", symbol: "Card" }],
  },
  {
    name: "Astro: an import in a client script is a dependency",
    fixture: "astro-site",
    apply: (d) =>
      edit(
        d,
        "src/components/Badge.astro",
        /$/,
        '\n<script>\n  import { track } from "../lib/analytics";\n  track("badge");\n</script>\n',
      ),
    expected: [{ rule: "undeclared_dependency", module: "components" }],
  },
];

describe("targeted changes to components produce exactly the expected violation", () => {
  for (const m of componentMutations) {
    it(m.name, async () => {
      const dir = copyFixture(m.fixture);
      expect((await archlock(dir, "init", "--yes")).code).toBe(0);
      m.apply(dir);
      const result = await checkJson(dir);
      const got = result.violations.map((v) => ({
        rule: v.rule,
        module: v.module,
        ...(v.symbol ? { symbol: v.symbol } : {}),
      }));
      expect(got).toEqual(m.expected);
    });
  }
});
