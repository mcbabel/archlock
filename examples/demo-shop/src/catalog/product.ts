import type { Money, ProductId } from "../shared/index.js";

export enum ProductStatus {
  Draft = "draft",
  Active = "active",
  Discontinued = "discontinued",
}

export interface Product {
  id: ProductId;
  sku: string;
  name: string;
  description: string;
  price: Money;
  weightGrams: number;
  status: ProductStatus;
  tags: string[];
}

export function isPurchasable(product: Product): boolean {
  return product.status === ProductStatus.Active;
}
