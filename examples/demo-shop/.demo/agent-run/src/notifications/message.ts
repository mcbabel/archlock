import type { Customer } from "../customers/index.js";
import type { InvoiceId } from "../shared/index.js";
import { Channel } from "./channel.js";

export interface Message {
  channel: Channel;
  to: string;
  subject: string;
  body: string;
}

export function invoicePaidMessage(customer: Customer, invoiceId: InvoiceId, paidAt: Date): Message {
  const date = paidAt.toISOString().slice(0, 10);
  return {
    channel: Channel.Email,
    to: customer.email,
    subject: "Thank you for your payment",
    body: [
      `Hello ${customer.name},`,
      "",
      `we received your payment for invoice ${invoiceId} on ${date}.`,
      "Your order is being prepared for shipping.",
      "",
      "Your demo-shop team",
    ].join("\n"),
  };
}
