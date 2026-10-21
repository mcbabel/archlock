import { type ProductRepository, searchProducts } from "../../catalog/index.js";
import { json, type Route } from "../http.js";

export function catalogRoutes(products: ProductRepository): Record<string, Route> {
  return {
    "GET /products": async (_req, res, params) => {
      const maxPrice = params.get("maxPrice");
      json(res, 200, searchProducts(products, {
        text: params.get("q") ?? undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      }));
    },
  };
}
