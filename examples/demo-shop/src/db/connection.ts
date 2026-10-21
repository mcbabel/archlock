import { Table } from "./table.js";
import type { Row, TableName } from "./types.js";

export class Database {
  private readonly tables = new Map<TableName, Table<Row>>();

  constructor(readonly name: string) {}

  table<T extends Row>(name: TableName): Table<T> {
    let table = this.tables.get(name);
    if (!table) {
      table = new Table<Row>();
      this.tables.set(name, table);
    }
    return table as unknown as Table<T>;
  }

  /** Runs `work` and rolls nothing back: the in-memory store has no transactions. */
  async transaction<T>(work: (db: Database) => Promise<T>): Promise<T> {
    return work(this);
  }
}

export function connect(url: string): Database {
  const name = new URL(url).pathname.replace(/^\//, "") || "shop";
  return new Database(name);
}
