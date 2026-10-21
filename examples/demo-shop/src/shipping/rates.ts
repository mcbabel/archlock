import { type Money, money } from "../shared/index.js";

export function shippingRate(country: string, weightGrams: number): Money {
  const base = country.toUpperCase() === "DE" ? 490 : 990;
  const extra = Math.max(0, Math.ceil((weightGrams - 2000) / 1000)) * 150;
  return money(base + extra);
}
