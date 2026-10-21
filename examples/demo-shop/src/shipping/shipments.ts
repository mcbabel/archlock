import { type Invoice, InvoiceStatus } from "../billing/index.js";
import type { Customer } from "../customers/index.js";
import type { EventBus } from "../events/index.js";
import { newId, type ShipmentId } from "../shared/index.js";
import { validateAddress } from "./address.js";

export interface Shipment {
  id: ShipmentId;
  invoiceNumber: string;
  address: Customer["address"];
  trackingCode: string;
}

export async function createShipment(invoice: Invoice, customer: Customer, events: EventBus): Promise<Shipment> {
  if (invoice.status !== InvoiceStatus.Paid) throw new Error(`invoice ${invoice.number} is not paid yet`);
  const problems = validateAddress(customer.address);
  if (problems.length > 0) throw new Error(`cannot ship: ${problems.join(", ")}`);
  const shipment: Shipment = {
    id: newId<ShipmentId>("shp"),
    invoiceNumber: invoice.number,
    address: customer.address,
    trackingCode: `TRK${invoice.number.replace(/\D/g, "")}`,
  };
  await events.publish({ type: "shipment.created", shipmentId: shipment.id, invoiceId: invoice.id });
  return shipment;
}
