export type Currency = "EUR" | "USD" | "GBP";

/** An amount in minor units (cents) to avoid floating point errors. */
export interface Money {
  readonly amount: number;
  readonly currency: Currency;
}

export function money(amount: number, currency: Currency = "EUR"): Money {
  if (!Number.isInteger(amount)) throw new Error(`amount must be in minor units, got ${amount}`);
  return { amount, currency };
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function multiply(m: Money, factor: number): Money {
  return { amount: Math.round(m.amount * factor), currency: m.currency };
}

export function sum(items: Money[], currency: Currency = "EUR"): Money {
  return items.reduce((total, m) => add(total, m), money(0, currency));
}

export function formatMoney(m: Money): string {
  const symbol = { EUR: "€", USD: "$", GBP: "£" }[m.currency];
  return `${symbol}${(m.amount / 100).toFixed(2)}`;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) throw new Error(`currency mismatch: ${a.currency} vs ${b.currency}`);
}
