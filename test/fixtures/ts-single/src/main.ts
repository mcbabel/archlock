import { createInvoice } from "./billing";
import { Database } from "./db";

export function main(): void {
  createInvoice(new Database("x"), "c1", []);
}
