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
  fixture:
    | "vue-app"
    | "svelte-app"
    | "astro-site"
    | "nuxt-app"
    | "go-service"
    | "rust-workspace"
    | "rust-crate"
    | "java-app"
    | "java-multi"
    | "csharp-app"
    | "csharp-single";
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
    name: "Nuxt: an auto-imported component in a template is still a dependency",
    fixture: "nuxt-app",
    apply: (d) => edit(d, "pages/index.vue", /^import CartSummary.*\n/m, ""),
    expected: [],
  },
  {
    name: "Nuxt: a lazy auto-imported component from an undeclared module",
    fixture: "nuxt-app",
    apply: (d) =>
      write(d, "composables/Badge.vue", '<template><LazyPriceTag :value="1" /></template>\n'),
    expected: [
      { rule: "public_symbol_added", module: "composables", symbol: "Badge" },
      { rule: "undeclared_dependency", module: "composables" },
    ],
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

const goMutations: ComponentMutation[] = [
  {
    name: "Go: a new exported function is a new public symbol",
    fixture: "go-service",
    apply: (d) =>
      edit(
        d,
        "internal/store/store.go",
        /$/,
        "\n// Count returns the number of users.\nfunc Count() int { return 0 }\n",
      ),
    expected: [{ rule: "public_symbol_added", module: "internal.store", symbol: "Count" }],
  },
  {
    name: "Go: an unexported function is not part of the API",
    fixture: "go-service",
    apply: (d) => edit(d, "internal/store/store.go", /$/, "\nfunc count() int { return 0 }\n"),
    expected: [],
  },
  {
    name: "Go: a changed parameter type changes the signature",
    fixture: "go-service",
    apply: (d) =>
      edit(d, "internal/store/store.go", "func New(path string,", "func New(path []byte,"),
    expected: [{ rule: "signature_changed", module: "internal.store", symbol: "New" }],
  },
  {
    name: "Go: a method in another file of the package changes its type",
    fixture: "go-service",
    apply: (d) =>
      write(
        d,
        "internal/store/close.go",
        "package store\n\n// Close releases the store.\nfunc (s *Store) Close() error { return nil }\n",
      ),
    expected: [{ rule: "signature_changed", module: "internal.store", symbol: "Store" }],
  },
  {
    name: "Go: a new exported struct field changes the type",
    fixture: "go-service",
    apply: (d) =>
      edit(
        d,
        "internal/model/user.go",
        "\tEmail     string\n",
        "\tEmail     string\n\tPhone     string\n",
      ),
    expected: [{ rule: "signature_changed", module: "internal.model", symbol: "User" }],
  },
  {
    name: "Go: importing another package of the module is a new dependency",
    fixture: "go-service",
    apply: (d) =>
      edit(
        d,
        "internal/model/constraints.go",
        "package model\n",
        'package model\n\nimport _ "example.com/shop/internal/store"\n',
      ),
    expected: [{ rule: "undeclared_dependency", module: "internal.model" }],
  },
  {
    name: "Go: standard library and external imports are no module dependencies",
    fixture: "go-service",
    apply: (d) =>
      edit(
        d,
        "internal/model/constraints.go",
        "package model\n",
        'package model\n\nimport (\n\t_ "os"\n\t_ "github.com/google/uuid"\n)\n',
      ),
    expected: [],
  },
  {
    name: "Go: a new package directory is an unassigned file",
    fixture: "go-service",
    apply: (d) =>
      write(
        d,
        "internal/cache/cache.go",
        "package cache\n\n// Size of the cache.\nconst Size = 64\n",
      ),
    expected: [{ rule: "unassigned_file", module: null }],
  },
];

const rustMutations: ComponentMutation[] = [
  {
    name: "Rust: a new pub function at the crate root is a new public symbol",
    fixture: "rust-workspace",
    apply: (d) => edit(d, "crates/core/src/lib.rs", /$/, "\npub fn reset() {}\n"),
    expected: [{ rule: "public_symbol_added", module: "shop_core", symbol: "reset" }],
  },
  {
    name: "Rust: pub(crate) and private items are not part of the API",
    fixture: "rust-workspace",
    apply: (d) =>
      edit(d, "crates/core/src/lib.rs", /$/, "\npub(crate) fn reset() {}\nfn other() {}\n"),
    expected: [],
  },
  {
    name: "Rust: a pub item in a private module is not part of the API",
    fixture: "rust-workspace",
    apply: (d) => edit(d, "crates/core/src/util_impl.rs", /$/, "\npub fn more() {}\n"),
    expected: [],
  },
  {
    name: "Rust: a new pub field of a re-exported struct changes it",
    fixture: "rust-workspace",
    apply: (d) =>
      edit(
        d,
        "crates/core/src/model/user.rs",
        "    pub id: u64,\n",
        "    pub id: u64,\n    pub admin: bool,\n",
      ),
    expected: [{ rule: "signature_changed", module: "shop_core", symbol: "model__User" }],
  },
  {
    name: "Rust: changed variant data changes the enum",
    fixture: "rust-workspace",
    apply: (d) => edit(d, "crates/core/src/error.rs", "NotFound(u64),", "NotFound(u64, String),"),
    expected: [{ rule: "signature_changed", module: "shop_core", symbol: "Error" }],
  },
  {
    name: "Rust: a method in an impl block of another file changes its type",
    fixture: "rust-workspace",
    apply: (d) => {
      edit(d, "crates/core/src/store/mod.rs", "pub mod memory;\n", "pub mod memory;\nmod extra;\n");
      write(
        d,
        "crates/core/src/store/extra.rs",
        "use super::memory::MemoryStore;\n\nimpl MemoryStore {\n    pub fn len(&self) -> usize { 0 }\n}\n",
      );
    },
    expected: [
      { rule: "signature_changed", module: "shop_core", symbol: "store__memory__MemoryStore" },
    ],
  },
  {
    name: "Rust: a new trait implementation changes the type's bases",
    fixture: "rust-workspace",
    apply: (d) =>
      edit(
        d,
        "crates/core/src/model/user.rs",
        /$/,
        "\nimpl std::fmt::Display for Role {\n    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { Ok(()) }\n}\n",
      ),
    expected: [{ rule: "signature_changed", module: "shop_core", symbol: "model__Role" }],
  },
  {
    name: "Rust: a use of another top-level module is a new dependency",
    fixture: "rust-crate",
    apply: (d) => edit(d, "src/parser/ast.rs", /^/, "use crate::util::width;\n"),
    expected: [{ rule: "undeclared_dependency", module: "parser" }],
  },
  {
    name: "Rust: an inline path without use is a dependency too",
    fixture: "rust-crate",
    apply: (d) =>
      edit(
        d,
        "src/util.rs",
        /$/,
        "\npub fn doc() -> crate::parser::ast::Document { Default::default() }\n",
      ),
    expected: [
      { rule: "public_symbol_added", module: "util", symbol: "doc" },
      { rule: "undeclared_dependency", module: "util" },
    ],
  },
  {
    name: "Rust: standard library and crates.io imports are no module dependencies",
    fixture: "rust-crate",
    apply: (d) =>
      edit(
        d,
        "src/util.rs",
        /^/,
        "use std::collections::HashMap;\nuse unicode_width::UnicodeWidthStr;\n",
      ),
    expected: [],
  },
];

const javaMutations: ComponentMutation[] = [
  {
    name: "Java: a new public method changes its class",
    fixture: "java-app",
    apply: (d) =>
      edit(
        d,
        "src/main/java/com/acme/shop/order/Order.java",
        "    public int[] quantities()",
        "    public void cancel() {}\n\n    public int[] quantities()",
      ),
    expected: [{ rule: "signature_changed", module: "order", symbol: "Order" }],
  },
  {
    name: "Java: protected, package-private and private members are not part of the API",
    fixture: "java-app",
    apply: (d) =>
      edit(
        d,
        "src/main/java/com/acme/shop/order/Order.java",
        "    public int[] quantities()",
        "    protected void a() {}\n    void b() {}\n    private void c() {}\n\n    public int[] quantities()",
      ),
    expected: [],
  },
  {
    name: "Java: a new public class is a new public symbol; a package-private one is not",
    fixture: "java-app",
    apply: (d) => {
      write(
        d,
        "src/main/java/com/acme/shop/order/Refund.java",
        "package com.acme.shop.order;\n\npublic class Refund {}\n",
      );
      write(
        d,
        "src/main/java/com/acme/shop/order/Internal.java",
        "package com.acme.shop.order;\n\nclass Internal {}\n",
      );
    },
    expected: [{ rule: "public_symbol_added", module: "order", symbol: "Refund" }],
  },
  {
    name: "Java: a new enum constant changes the enum",
    fixture: "java-app",
    apply: (d) =>
      edit(
        d,
        "src/main/java/com/acme/shop/order/Status.java",
        'NEW, PAID("paid"), SHIPPED;',
        'NEW, PAID("paid"), SHIPPED, CANCELLED;',
      ),
    expected: [{ rule: "signature_changed", module: "order", symbol: "order__Status" }],
  },
  {
    name: "Java: an import of another package is a new dependency",
    fixture: "java-app",
    apply: (d) =>
      edit(
        d,
        "src/main/java/com/acme/shop/billing/Invoice.java",
        "import java.time.Instant;",
        "import java.time.Instant;\nimport com.acme.shop.order.Order;",
      ),
    expected: [{ rule: "undeclared_dependency", module: "billing" }],
  },
  {
    name: "Java: a fully qualified name in code is a dependency too",
    fixture: "java-app",
    apply: (d) =>
      edit(
        d,
        "src/main/java/com/acme/shop/billing/BillingException.java",
        "super(message, cause); }",
        "super(message, cause); com.acme.shop.order.Order.class.getName(); }",
      ),
    expected: [{ rule: "undeclared_dependency", module: "billing" }],
  },
  {
    name: "Java: JDK and library imports are no module dependencies",
    fixture: "java-app",
    apply: (d) =>
      edit(
        d,
        "src/main/java/com/acme/shop/billing/Invoice.java",
        "import java.time.Instant;",
        "import java.time.Instant;\nimport java.util.concurrent.*;\nimport com.google.common.collect.ImmutableList;",
      ),
    expected: [],
  },
  {
    name: "Java: a dependency between build modules",
    fixture: "java-multi",
    apply: (d) =>
      edit(
        d,
        "core/src/main/java/org/demo/core/Greeter.java",
        "package org.demo.core;",
        "package org.demo.core;\n\nimport org.demo.app.Main;",
      ),
    expected: [{ rule: "undeclared_dependency", module: "core" }],
  },
];

const csharpMutations: ComponentMutation[] = [
  {
    name: "C#: a new public method changes its class",
    fixture: "csharp-app",
    apply: (d) =>
      edit(
        d,
        "src/Shop.Core/Orders/Order.cs",
        "    public Order(string id) => Id = id;",
        "    public Order(string id) => Id = id;\n\n    public void Cancel() { }",
      ),
    expected: [{ rule: "signature_changed", module: "Shop.Core", symbol: "Order" }],
  },
  {
    name: "C#: a member in another part of a partial class changes the class",
    fixture: "csharp-app",
    apply: (d) =>
      edit(
        d,
        "src/Shop.Core/Orders/Order.Lines.cs",
        "    public object Clone() => MemberwiseClone();",
        "    public object Clone() => MemberwiseClone();\n\n    public int Count => lines.Count;",
      ),
    expected: [{ rule: "signature_changed", module: "Shop.Core", symbol: "Order" }],
  },
  {
    name: "C#: internal, protected and private members are not part of the API",
    fixture: "csharp-app",
    apply: (d) =>
      edit(
        d,
        "src/Shop.Core/Orders/Order.cs",
        "    public Order(string id) => Id = id;",
        "    public Order(string id) => Id = id;\n    internal void A() { }\n    protected void B() { }\n    private void C() { }\n    void D() { }",
      ),
    expected: [],
  },
  {
    name: "C#: a new public type is a new public symbol; an internal one is not",
    fixture: "csharp-app",
    apply: (d) => {
      write(
        d,
        "src/Shop.Core/Orders/Refund.cs",
        "namespace Shop.Core.Orders;\n\npublic class Refund { }\n",
      );
      write(d, "src/Shop.Core/Orders/Audit.cs", "namespace Shop.Core.Orders;\n\nclass Audit { }\n");
    },
    expected: [{ rule: "public_symbol_added", module: "Shop.Core", symbol: "Refund" }],
  },
  {
    name: "C#: a new enum member changes the enum",
    fixture: "csharp-app",
    apply: (d) =>
      edit(
        d,
        "src/Shop.Core/Orders/OrderStatus.cs",
        "    Shipped,",
        "    Shipped,\n    Cancelled,",
      ),
    expected: [{ rule: "signature_changed", module: "Shop.Core", symbol: "OrderStatus" }],
  },
  {
    name: "C#: using a type of a referenced project is a new dependency",
    fixture: "csharp-app",
    apply: (d) => {
      edit(
        d,
        "src/Shop.Core/Shop.Core.csproj",
        "</Project>",
        '  <ItemGroup>\n    <ProjectReference Include="..\\Shop.Api\\Shop.Api.csproj" />\n  </ItemGroup>\n</Project>',
      );
      edit(
        d,
        "src/Shop.Core/Billing/Invoice.cs",
        "    public bool IsPaid { get; init; }",
        "    public bool IsPaid { get; init; }\n\n    public object? Source { get; } = typeof(Shop.Api.Controllers.OrdersController);",
      );
    },
    expected: [
      { rule: "signature_changed", module: "Shop.Core", symbol: "Invoice" },
      { rule: "undeclared_dependency", module: "Shop.Core" },
    ],
  },
  {
    name: "C#: a type of a project that is not referenced is no dependency",
    fixture: "csharp-app",
    apply: (d) =>
      edit(
        d,
        "src/Shop.Core/Billing/Invoice.cs",
        "namespace Shop.Core.Billing;",
        "using Shop.Api.Controllers;\n\nnamespace Shop.Core.Billing;",
      ),
    expected: [],
  },
  {
    name: "C#: a type from a parent namespace is a dependency without a using",
    fixture: "csharp-single",
    apply: (d) =>
      edit(
        d,
        "Catalog/Product.cs",
        "    public decimal Price { get; set; }",
        "    public decimal Price { get; set; }\n\n    public Cart.ShoppingCart? LastCart { get; set; }",
      ),
    expected: [
      { rule: "signature_changed", module: "Catalog", symbol: "Product" },
      { rule: "undeclared_dependency", module: "Catalog" },
    ],
  },
  {
    name: "C#: framework and package usings are no module dependencies",
    fixture: "csharp-single",
    apply: (d) =>
      edit(
        d,
        "Catalog/Catalog.cs",
        /^/,
        "using System.Text.Json;\nusing Microsoft.Extensions.Logging;\n",
      ),
    expected: [],
  },
];

describe("targeted changes to C# code produce exactly the expected violation", () => {
  for (const m of csharpMutations) {
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

describe("targeted changes to Java code produce exactly the expected violation", () => {
  for (const m of javaMutations) {
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

describe("targeted changes to Rust code produce exactly the expected violation", () => {
  for (const m of rustMutations) {
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

describe("targeted changes to Go code produce exactly the expected violation", () => {
  for (const m of goMutations) {
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
