let counter = 0;

/** Sequential, human-readable invoice numbers: INV-2026-000042. */
export function nextInvoiceNumber(issuedAt: Date): string {
  counter += 1;
  return `INV-${issuedAt.getUTCFullYear()}-${String(counter).padStart(6, "0")}`;
}
