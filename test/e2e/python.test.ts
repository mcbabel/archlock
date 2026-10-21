import { afterAll, describe, expect, it } from "vitest";
import {
  archlock,
  checkJson,
  cleanupFixtures,
  copyFixture,
  edit,
  read,
} from "../helpers/fixtures.js";

afterAll(cleanupFixtures);

interface Mutation {
  name: string;
  apply: (dir: string) => void;
  expected: { rule: string; module: string | null; symbol?: string }[];
}

const mutations: Mutation[] = [
  {
    name: "new function exported through __all__",
    apply: (d) => {
      edit(
        d,
        "src/shopkit/billing/service.py",
        /$/,
        "\n\ndef refund(invoice_id: str) -> None:\n    pass\n",
      );
      edit(
        d,
        "src/shopkit/billing/__init__.py",
        "from .service import create_invoice, mark_paid",
        "from .service import create_invoice, mark_paid, refund",
      );
      edit(d, "src/shopkit/billing/__init__.py", '"mark_paid"]', '"mark_paid", "refund"]');
    },
    expected: [{ rule: "public_symbol_added", module: "billing", symbol: "refund" }],
  },
  {
    name: "a public function that is not in __all__ stays private",
    apply: (d) =>
      edit(
        d,
        "src/shopkit/billing/service.py",
        /$/,
        "\n\ndef refund(invoice_id: str) -> None:\n    pass\n",
      ),
    expected: [],
  },
  {
    name: "dataclass field added",
    apply: (d) =>
      edit(
        d,
        "src/shopkit/billing/models.py",
        "    customer: str\n",
        "    customer: str\n    due: str | None = None\n",
      ),
    expected: [{ rule: "signature_changed", module: "billing", symbol: "Invoice" }],
  },
  {
    name: "enum member removed",
    apply: (d) => edit(d, "src/shopkit/billing/models.py", '    SENT = "sent"\n', ""),
    expected: [{ rule: "signature_changed", module: "billing", symbol: "InvoiceStatus" }],
  },
  {
    name: "keyword-only parameter changed",
    apply: (d) =>
      edit(
        d,
        "src/shopkit/billing/service.py",
        "*, session: Session | None = None",
        "*, session: Session",
      ),
    expected: [{ rule: "signature_changed", module: "billing", symbol: "create_invoice" }],
  },
  {
    name: "new import of another subpackage (absolute)",
    apply: (d) =>
      edit(d, "src/shopkit/events/__init__.py", /^/, "from shopkit.db.session import Session\n"),
    expected: [{ rule: "undeclared_dependency", module: "events" }],
  },
  {
    name: "new import of another subpackage (relative)",
    apply: (d) => edit(d, "src/shopkit/db/session.py", /^/, "from ..events import emit\n"),
    expected: [{ rule: "undeclared_dependency", module: "db" }],
  },
  {
    name: "submodule import counts as a dependency on that module",
    apply: (d) =>
      edit(d, "src/shopkit/events/__init__.py", /^/, "from shopkit.db import session\n"),
    expected: [{ rule: "undeclared_dependency", module: "events" }],
  },
  {
    name: "stdlib is never external; third-party packages are",
    apply: (d) => {
      edit(
        d,
        "archlock/billing.arch.py",
        '__depends_on__ = ["db", "events"]',
        '__depends_on__ = ["db", "events"]\n__external__ = []',
      );
      edit(d, "src/shopkit/billing/service.py", /^/, "import json\nimport os.path\n");
    },
    expected: [{ rule: "undeclared_external", module: "billing" }],
  },
  {
    name: "planned function in the sketch",
    apply: (d) => edit(d, "archlock/events.arch.py", /$/, "\ndef off(name: str) -> None: ...\n"),
    expected: [{ rule: "planned_not_implemented", module: "events", symbol: "off" }],
  },
];

describe("Python: targeted changes produce exactly the expected violation (py-src)", () => {
  for (const m of mutations) {
    it(m.name, async () => {
      const dir = copyFixture("py-src");
      expect((await archlock(dir, "init", "--yes")).code).toBe(0);
      m.apply(dir);
      const got = (await checkJson(dir)).violations.map((v) => ({
        rule: v.rule,
        module: v.module,
        ...(v.symbol ? { symbol: v.symbol } : {}),
      }));
      expect(got).toEqual(m.expected);
    });
  }

  it("accept adopts Python changes and keeps comments", async () => {
    const dir = copyFixture("py-src");
    await archlock(dir, "init", "--yes");
    edit(
      dir,
      "archlock/billing.arch.py",
      "class Invoice:",
      "# invariant: total equals the sum of lines\nclass Invoice:",
    );
    edit(
      dir,
      "src/shopkit/billing/models.py",
      "    customer: str\n",
      "    customer: str\n    due: str | None = None\n",
    );
    expect((await archlock(dir, "accept", "--yes")).code).toBe(0);
    expect((await checkJson(dir)).summary.errors).toBe(0);
    expect(read(dir, "archlock/billing.arch.py")).toContain(
      "# invariant: total equals the sum of lines\n@dataclass\nclass Invoice:",
    );
  });
});
