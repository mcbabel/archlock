import type { CartId, CustomerId, InvoiceId, Money, ProductId, ShipmentId } from "../shared/index.js";

export type DomainEvent =
  | { type: "product.created"; productId: ProductId }
  | { type: "cart.checked_out"; cartId: CartId; customerId: CustomerId; total: Money }
  | { type: "invoice.issued"; invoiceId: InvoiceId; customerId: CustomerId; total: Money }
  | { type: "invoice.paid"; invoiceId: InvoiceId; customerId: CustomerId; paidAt: Date }
  | { type: "shipment.created"; shipmentId: ShipmentId; invoiceId: InvoiceId };

export type EventName = DomainEvent["type"];

export type EventOf<N extends EventName> = Extract<DomainEvent, { type: N }>;

export type Handler<N extends EventName> = (event: EventOf<N>) => void | Promise<void>;
