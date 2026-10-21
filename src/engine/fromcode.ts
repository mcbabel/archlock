import { type ArchModule, compareNames, emptyModuleSoft } from "../core/model.js";
import type { CodeModule } from "../extract/index.js";

/** Builds a module sketch from code alone, without human-written content. */
export function moduleFromCode(code: CodeModule): ArchModule {
  return {
    name: code.name,
    paths: [...code.spec.paths],
    entry: code.spec.entry,
    dependsOn: [...code.deps.keys()].sort(compareNames),
    external: null,
    strictness: "signatures",
    reexports: code.reexports.map((r) => ({ ...r, names: [...r.names], leading: [] })),
    symbols: structuredClone(code.symbols),
    soft: emptyModuleSoft(),
  };
}
