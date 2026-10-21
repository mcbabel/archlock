import { type BillingDeps, issueInvoice, markPaid } from "../../billing/index.js";
import { type Cart, checkout } from "../../cart/index.js";
import type { CustomerRepository } from "../../customers/index.js";
import type { InvoiceId } from "../../shared/index.js";
import { json, readJson, type Route } from "../http.js";

export interface CheckoutRouteDeps {
  billing: BillingDeps;
  customers: CustomerRepository;
  carts: Map<string, Cart>;
}

export function checkoutRoutes(deps: CheckoutRouteDeps): Record<string, Route> {
  return {
    "POST /checkout": async (req, res) => {
      const { cartId } = await readJson<{ cartId: string }>(req);
      const cart = deps.carts.get(cartId);
      if (!cart) return json(res, 404, { error: "unknown cart" });
      const customer = deps.customers.get(cart.customerId);
      if (!customer) return json(res, 404, { error: "unknown customer" });
      const result = await checkout(cart, deps.billing);
      if (!result.ok) return json(res, 422, { error: result.error });
      const invoice = await issueInvoice(deps.billing, result.value, customer);
      json(res, 201, invoice);
    },
    "POST /payments/webhook": async (req, res) => {
      const body = await readJson<{
        invoiceId: InvoiceId;
        provider: string;
        reference: string;
        paidAt?: string;
      }>(req);
      // The provider's timestamp is authoritative; fall back to now for providers without one.
      const paidAt = body.paidAt ? new Date(body.paidAt) : new Date();
      const invoice = await markPaid(
        deps.billing,
        body.invoiceId,
        { provider: body.provider, reference: body.reference },
        paidAt,
      );
      json(res, 200, invoice);
    },
  };
}
