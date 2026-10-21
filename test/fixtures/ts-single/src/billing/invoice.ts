import { Database } from "@/db";

export type CustomerId = string;

export enum InvoiceStatus {
  Draft = "draft",
  Sent = "sent",
  Paid = "paid",
}

export interface Invoice {
  id: string;
  customer: CustomerId;
  status: "draft" | "sent" | "paid";
  lines: Array<{ amount: number }>;
  total(): number;
}

export function createInvoice(db: Database, customer: CustomerId, lines: Invoice["lines"]): Invoice {
  throw new Error("not implemented");
}
