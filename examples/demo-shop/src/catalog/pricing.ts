import { type Money, multiply } from "../shared/index.js";
import type { Product } from "./product.js";

/** Volume discounts: 5% from 10 items, 10% from 50 items. */
export const VOLUME_DISCOUNTS: ReadonlyArray<{ minQuantity: number; factor: number }> = [
  { minQuantity: 50, factor: 0.9 },
  { minQuantity: 10, factor: 0.95 },
];

export function unitPrice(product: Product, quantity: number): Money {
  const tier = VOLUME_DISCOUNTS.find((t) => quantity >= t.minQuantity);
  return tier ? multiply(product.price, tier.factor) : product.price;
}

export function linePrice(product: Product, quantity: number): Money {
  if (quantity <= 0) throw new Error("quantity must be positive");
  return multiply(unitPrice(product, quantity), quantity);
}
