import type { CustomerRepository } from "../customers/index.js";
import type { EventBus } from "../events/index.js";
import type { InvoiceId } from "../shared/index.js";
import { invoicePaidMessage } from "./message.js";
import type { Notifier } from "./notifier.js";

/**
 * Sends one message per paid invoice. Returns a function that unsubscribes.
 * Duplicate `invoice.paid` events (e.g. webhook retries) do not send twice.
 */
export function registerNotifications(
  events: EventBus,
  customers: CustomerRepository,
  notifier: Notifier,
): () => void {
  const notified = new Set<InvoiceId>();
  return events.subscribe("invoice.paid", async (event) => {
    if (notified.has(event.invoiceId)) return;
    const customer = customers.get(event.customerId);
    if (!customer) return;
    notified.add(event.invoiceId);
    await notifier.send(invoicePaidMessage(customer, event.invoiceId, event.paidAt));
  });
}
