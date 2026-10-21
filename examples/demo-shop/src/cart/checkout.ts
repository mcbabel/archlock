import type { ProductRepository } from "../catalog/index.js";
import { isPurchasable } from "../catalog/index.js";
import type { EventBus } from "../events/index.js";
import { type Clock, err, ok, type Result } from "../shared/index.js";
import type { Cart } from "./cart.js";
import { type CartTotals, cartTotals } from "./totals.js";

export interface CheckoutSummary {
  cart: Cart;
  totals: CartTotals;
}

export interface CheckoutDeps {
  products: ProductRepository;
  events: EventBus;
  clock: Clock;
}

export async function checkout(cart: Cart, deps: CheckoutDeps): Promise<Result<CheckoutSummary>> {
  if (cart.items.length === 0) return err("the cart is empty");
  for (const item of cart.items) {
    const product = deps.products.get(item.productId);
    if (!product || !isPurchasable(product)) return err(`product ${item.productId} is not available`);
  }
  const totals = cartTotals(cart, deps.products, deps.clock.now());
  await deps.events.publish({
    type: "cart.checked_out",
    cartId: cart.id,
    customerId: cart.customerId,
    total: totals.total,
  });
  return ok({ cart, totals });
}
