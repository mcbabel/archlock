import type { CustomerId, InvoiceId, Money, ProductId } from "../shared/index.js";

export enum InvoiceStatus {
  Draft = "draft",
  Issued = "issued",
  Paid = "paid",
  Refunded = "refunded",
}

export interface InvoiceLine {
  productId: ProductId;
  description: string;
  quantity: number;
  amount: Money;
}

export interface Invoice {
  id: InvoiceId;
  number: string;
  customerId: CustomerId;
  lines: InvoiceLine[];
  tax: Money;
  total: Money;
  status: InvoiceStatus;
  issuedAt: Date;
  paidAt?: Date;
  paymentRef?: string;
}
