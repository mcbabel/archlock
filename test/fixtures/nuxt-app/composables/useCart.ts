import { formatPrice } from "~~/utils/format";

export interface CartLine {
  sku: string;
  quantity: number;
}

export function useCart(): { lines: CartLine[]; total: () => string } {
  const lines: CartLine[] = [];
  return { lines, total: () => formatPrice(lines.length) };
}
