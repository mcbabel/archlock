import { linePrice, type ProductRepository } from "../catalog/index.js";
import { type Money, sum } from "../shared/index.js";
import type { Cart } from "./cart.js";
import { applyDiscount, findDiscount } from "./discounts.js";

export interface CartTotals {
  subtotal: Money;
  discount: Money;
  total: Money;
}

export function cartTotals(cart: Cart, products: ProductRepository, now: Date): CartTotals {
  const lines = cart.items.map((item) => {
    const product = products.get(item.productId);
    if (!product) throw new Error(`unknown product ${item.productId}`);
    return linePrice(product, item.quantity);
  });
  const subtotal = sum(lines);
  const total = applyDiscount(subtotal, cart.discountCode ? findDiscount(cart.discountCode, now) : undefined);
  return { subtotal, discount: { amount: subtotal.amount - total.amount, currency: subtotal.currency }, total };
}
