import type { Row } from "./types.js";

/** An in-memory table with the same interface as a database-backed repository. */
export class Table<T extends Row> {
  private readonly rows = new Map<string, T>();

  insert(row: T): T {
    if (this.rows.has(row.id)) throw new Error(`duplicate id ${row.id}`);
    this.rows.set(row.id, structuredClone(row));
    return row;
  }

  get(id: string): T | undefined {
    const row = this.rows.get(id);
    return row ? structuredClone(row) : undefined;
  }

  update(id: string, patch: Partial<Omit<T, "id">>): T {
    const current = this.rows.get(id);
    if (!current) throw new Error(`no row with id ${id}`);
    const next = { ...current, ...patch };
    this.rows.set(id, next);
    return structuredClone(next);
  }

  find(predicate: (row: T) => boolean): T[] {
    return [...this.rows.values()].filter(predicate).map((r) => structuredClone(r));
  }

  all(): T[] {
    return this.find(() => true);
  }

  get size(): number {
    return this.rows.size;
  }
}
