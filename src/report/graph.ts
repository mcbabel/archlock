import { type ArchModule, compareNames } from "../core/model.js";

function nodeId(name: string): string {
  return name.replace(/[^A-Za-z0-9_]/g, "_");
}

function node(name: string): string {
  const id = nodeId(name);
  return id === name ? name : `${id}["${name}"]`;
}

/** The declared module graph (`__depends_on__`) as a Mermaid flowchart. Deterministic. */
export function mermaidGraph(modules: ArchModule[]): string {
  const sorted = [...modules].sort((a, b) => compareNames(a.name, b.name));
  const lines = ["graph LR"];
  const connected = new Set<string>();
  for (const m of sorted) {
    for (const dep of [...m.dependsOn].sort(compareNames)) {
      lines.push(`  ${node(m.name)} --> ${node(dep)}`);
      connected.add(m.name);
      connected.add(dep);
    }
  }
  for (const m of sorted) if (!connected.has(m.name)) lines.push(`  ${node(m.name)}`);
  return `${lines.join("\n")}\n`;
}
