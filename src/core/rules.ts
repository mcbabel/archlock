/** Violation types and their default severities (`archlock check`). */

export type Severity = "error" | "warn" | "info" | "off";

export const SEVERITIES: readonly Severity[] = ["error", "warn", "info", "off"];

export const RULE_DEFAULTS = {
  undeclared_dependency: "error",
  unused_dependency: "info",
  undeclared_external: "error",
  public_symbol_added: "error",
  planned_not_implemented: "error",
  signature_changed: "error",
  kind_changed: "error",
  deep_import: "warn",
  unassigned_file: "warn",
  dependency_cycle: "off",
  sketch_invalid: "error",
} as const satisfies Record<string, Severity>;

export type RuleName = keyof typeof RULE_DEFAULTS;

export const RULE_NAMES = Object.keys(RULE_DEFAULTS) as RuleName[];

/** Rules whose severity cannot be configured. */
export const FIXED_RULES: readonly RuleName[] = ["sketch_invalid"];

export const RULE_DESCRIPTIONS: Record<RuleName, string> = {
  undeclared_dependency: "code imports a module that is not in __depends_on__",
  unused_dependency: "a module in __depends_on__ is never imported",
  undeclared_external: "code imports an external package that is not in __external__",
  public_symbol_added: "a public symbol exists in code but not in the sketch",
  planned_not_implemented: "a symbol is in the sketch but not (yet) in the code",
  signature_changed: "parameters, types, fields, bases or members differ from the sketch",
  kind_changed: "a symbol changed its kind (e.g. a function became a class)",
  deep_import: "another module imports a symbol that is not part of this module's public API",
  unassigned_file: "a source file belongs to no module",
  dependency_cycle: "modules depend on each other in a cycle",
  sketch_invalid: "a sketch cannot be parsed or is inconsistent",
};
