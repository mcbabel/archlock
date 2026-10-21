import type { InvoiceId } from "../shared/index.js";
import type { PaymentRef } from "./gateway.js";
import { type Invoice, InvoiceStatus } from "./invoice.js";
import { type BillingDeps, invoices } from "./service.js";

export async function payInvoice(deps: BillingDeps, invoiceId: InvoiceId): Promise<Invoice> {
  const invoice = invoices(deps).get(invoiceId);
  if (!invoice) throw new Error(`unknown invoice ${invoiceId}`);
  const payment = await deps.gateway.charge(invoice.total, `Invoice ${invoice.number}`);
  return markPaid(deps, invoiceId, payment, deps.clock.now());
}

export async function markPaid(
  deps: BillingDeps,
  invoiceId: InvoiceId,
  payment: PaymentRef,
  paidAt: Date,
): Promise<Invoice> {
  const invoice = invoices(deps).get(invoiceId);
  if (!invoice) throw new Error(`unknown invoice ${invoiceId}`);
  if (invoice.status === InvoiceStatus.Paid) return invoice;
  if (invoice.status !== InvoiceStatus.Issued) throw new Error(`invoice ${invoice.number} is ${invoice.status}`);
  const paid = invoices(deps).update(invoiceId, {
    status: InvoiceStatus.Paid,
    paidAt,
    paymentRef: payment.reference,
  });
  await deps.events.publish({ type: "invoice.paid", invoiceId, customerId: invoice.customerId, paidAt });
  return paid;
}

export async function refund(deps: BillingDeps, invoiceId: InvoiceId): Promise<Invoice> {
  const invoice = invoices(deps).get(invoiceId);
  if (!invoice?.paymentRef) throw new Error(`invoice ${invoiceId} is not paid`);
  await deps.gateway.refund({ provider: "fake", reference: invoice.paymentRef });
  return invoices(deps).update(invoiceId, { status: InvoiceStatus.Refunded });
}
