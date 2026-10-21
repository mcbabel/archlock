import type { Address } from "../customers/index.js";

const POSTAL_CODES: Record<string, RegExp> = {
  DE: /^\d{5}$/,
  FR: /^\d{5}$/,
  NL: /^\d{4} ?[A-Z]{2}$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/,
};

export function validateAddress(address: Address): string[] {
  const problems: string[] = [];
  if (!address.street.trim()) problems.push("street is required");
  if (!address.city.trim()) problems.push("city is required");
  const pattern = POSTAL_CODES[address.country.toUpperCase()];
  if (!pattern) problems.push(`we do not ship to ${address.country}`);
  else if (!pattern.test(address.postalCode.toUpperCase())) problems.push("postal code is invalid");
  return problems;
}
