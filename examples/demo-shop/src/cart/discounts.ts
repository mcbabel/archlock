import { type Money, multiply } from "../shared/index.js";

export interface DiscountCode {
  code: string;
  percentOff: number;
  expiresAt?: Date;
}

const CODES: DiscountCode[] = [
  { code: "WELCOME10", percentOff: 10 },
  { code: "SUMMER25", percentOff: 25, expiresAt: new Date("2027-09-01") },
];

export function findDiscount(code: string, now: Date): DiscountCode | undefined {
  const found = CODES.find((c) => c.code === code.toUpperCase());
  if (!found || (found.expiresAt && found.expiresAt < now)) return undefined;
  return found;
}

export function applyDiscount(total: Money, discount: DiscountCode | undefined): Money {
  return discount ? multiply(total, 1 - discount.percentOff / 100) : total;
}
