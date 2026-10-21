import type { Database, Table } from "../db/index.js";
import type { EventBus } from "../events/index.js";
import { type Money, newId, type ProductId } from "../shared/index.js";
import { type Product, ProductStatus } from "./product.js";

export interface NewProduct {
  sku: string;
  name: string;
  description?: string;
  price: Money;
  weightGrams: number;
  tags?: string[];
}

export class ProductRepository {
  private readonly table: Table<Product>;

  constructor(
    db: Database,
    private readonly events: EventBus,
  ) {
    this.table = db.table<Product>("products");
  }

  async create(input: NewProduct): Promise<Product> {
    if (this.findBySku(input.sku)) throw new Error(`SKU ${input.sku} already exists`);
    const product: Product = {
      id: newId<ProductId>("prod"),
      sku: input.sku,
      name: input.name,
      description: input.description ?? "",
      price: input.price,
      weightGrams: input.weightGrams,
      status: ProductStatus.Active,
      tags: input.tags ?? [],
    };
    this.table.insert(product);
    await this.events.publish({ type: "product.created", productId: product.id });
    return product;
  }

  get(id: ProductId): Product | undefined {
    return this.table.get(id);
  }

  findBySku(sku: string): Product | undefined {
    return this.table.find((p) => p.sku === sku)[0];
  }

  list(): Product[] {
    return this.table.all().sort((a, b) => a.name.localeCompare(b.name));
  }

  discontinue(id: ProductId): Product {
    return this.table.update(id, { status: ProductStatus.Discontinued });
  }
}
