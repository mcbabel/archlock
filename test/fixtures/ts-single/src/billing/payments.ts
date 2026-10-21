import { emit } from "../events";
import type { Invoice } from "./invoice";

export async function markPaid(id: string, payment: { ref: string }): Promise<Invoice> {
  emit("invoice.paid", { id });
  throw new Error("not implemented");
}

export function internalHelper() {
  return 1;
}
