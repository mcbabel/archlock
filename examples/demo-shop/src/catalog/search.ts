import type { Product } from "./product.js";
import { isPurchasable } from "./product.js";
import type { ProductRepository } from "./repository.js";

export interface SearchQuery {
  text?: string;
  tags?: string[];
  maxPrice?: number;
  includeUnavailable?: boolean;
}

export function searchProducts(repo: ProductRepository, query: SearchQuery): Product[] {
  const text = query.text?.toLowerCase().trim();
  return repo.list().filter((p) => {
    if (!query.includeUnavailable && !isPurchasable(p)) return false;
    if (text && !`${p.name} ${p.description}`.toLowerCase().includes(text)) return false;
    if (query.tags && !query.tags.every((t) => p.tags.includes(t))) return false;
    if (query.maxPrice !== undefined && p.price.amount > query.maxPrice) return false;
    return true;
  });
}
