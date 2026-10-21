import { type Money, multiply } from "../shared/index.js";

const VAT_RATES: Record<string, number> = {
  DE: 0.19,
  FR: 0.2,
  NL: 0.21,
  GB: 0.2,
};

export function vatRate(country: string): number {
  return VAT_RATES[country.toUpperCase()] ?? 0;
}

export function taxFor(net: Money, country: string): Money {
  return multiply(net, vatRate(country));
}
