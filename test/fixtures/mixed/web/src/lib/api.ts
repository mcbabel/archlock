export interface Product {
  id: string;
  price: number;
}

export async function fetchProducts(baseUrl: string): Promise<Product[]> {
  const res = await fetch(`${baseUrl}/products`);
  return (await res.json()) as Product[];
}
