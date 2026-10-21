import { addItem, type Cart, createCart } from "../../cart/index.js";
import type { CustomerId, ProductId } from "../../shared/index.js";
import { json, readJson, type Route } from "../http.js";

export function cartRoutes(carts: Map<string, Cart>): Record<string, Route> {
  return {
    "POST /carts": async (req, res) => {
      const { customerId } = await readJson<{ customerId: CustomerId }>(req);
      const cart = createCart(customerId);
      carts.set(cart.id, cart);
      json(res, 201, cart);
    },
    "POST /carts/items": async (req, res) => {
      const body = await readJson<{ cartId: string; productId: ProductId; quantity?: number }>(req);
      const cart = carts.get(body.cartId);
      if (!cart) return json(res, 404, { error: "unknown cart" });
      const next = addItem(cart, body.productId, body.quantity);
      carts.set(next.id, next);
      json(res, 200, next);
    },
  };
}
