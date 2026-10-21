import type { ProductId } from "../shared/index.js";

export interface LineItem {
  productId: ProductId;
  quantity: number;
}

export function mergeLineItems(items: LineItem[]): LineItem[] {
  const byProduct = new Map<ProductId, number>();
  for (const item of items) byProduct.set(item.productId, (byProduct.get(item.productId) ?? 0) + item.quantity);
  return [...byProduct].map(([productId, quantity]) => ({ productId, quantity }));
}
