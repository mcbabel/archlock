import { fetchProducts } from "../lib/api";

export async function renderHome(root: HTMLElement): Promise<void> {
  const products = await fetchProducts("/api");
  root.textContent = products.map((p) => p.id).join(", ");
}
