import type { CheckoutSummary } from "../cart/index.js";
import type { ProductRepository } from "../catalog/index.js";
import type { Customer } from "../customers/index.js";
import type { Database, Table } from "../db/index.js";
import type { EventBus } from "../events/index.js";
import { add, type Clock, type InvoiceId, newId } from "../shared/index.js";
import type { PaymentGateway } from "./gateway.js";
import { type Invoice, type InvoiceLine, InvoiceStatus } from "./invoice.js";
import { nextInvoiceNumber } from "./numbering.js";
import { taxFor } from "./tax.js";

export interface BillingDeps {
  db: Database;
  events: EventBus;
  products: ProductRepository;
  gateway: PaymentGateway;
  clock: Clock;
}

export function invoices(deps: BillingDeps): Table<Invoice> {
  return deps.db.table<Invoice>("invoices");
}

export async function issueInvoice(deps: BillingDeps, summary: CheckoutSummary, customer: Customer): Promise<Invoice> {
  const issuedAt = deps.clock.now();
  const lines: InvoiceLine[] = summary.cart.items.map((item) => {
    const product = deps.products.get(item.productId);
    if (!product) throw new Error(`unknown product ${item.productId}`);
    return {
      productId: item.productId,
      description: product.name,
      quantity: item.quantity,
      amount: { amount: product.price.amount * item.quantity, currency: product.price.currency },
    };
  });
  const tax = taxFor(summary.totals.total, customer.address.country);
  const invoice: Invoice = {
    id: newId<InvoiceId>("inv"),
    number: nextInvoiceNumber(issuedAt),
    customerId: customer.id,
    lines,
    tax,
    total: add(summary.totals.total, tax),
    status: InvoiceStatus.Issued,
    issuedAt,
  };
  invoices(deps).insert(invoice);
  await deps.events.publish({ type: "invoice.issued", invoiceId: invoice.id, customerId: customer.id, total: invoice.total });
  return invoice;
}

export function getInvoice(deps: BillingDeps, id: InvoiceId): Invoice | undefined {
  return invoices(deps).get(id);
}
