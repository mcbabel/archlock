import { type CartId, type CustomerId, newId, type ProductId } from "../shared/index.js";
import { type LineItem, mergeLineItems } from "./line-item.js";

export interface Cart {
  id: CartId;
  customerId: CustomerId;
  items: LineItem[];
  discountCode?: string;
}

export function createCart(customerId: CustomerId): Cart {
  return { id: newId<CartId>("cart"), customerId, items: [] };
}

export function addItem(cart: Cart, productId: ProductId, quantity = 1): Cart {
  if (quantity <= 0) throw new Error("quantity must be positive");
  return { ...cart, items: mergeLineItems([...cart.items, { productId, quantity }]) };
}

export function removeItem(cart: Cart, productId: ProductId): Cart {
  return { ...cart, items: cart.items.filter((i) => i.productId !== productId) };
}
