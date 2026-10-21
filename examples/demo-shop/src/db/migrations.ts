import type { Database } from "./connection.js";
import type { TableName } from "./types.js";

const TABLES: TableName[] = ["products", "customers", "carts", "invoices", "shipments"];

/** Creates all tables. Idempotent. */
export function migrate(db: Database): TableName[] {
  for (const name of TABLES) db.table(name);
  return TABLES;
}
