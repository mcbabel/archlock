import { cartRoutes, catalogRoutes, checkoutRoutes, createApiServer } from "./api/index.js";
import { type BillingDeps, FakeGateway } from "./billing/index.js";
import type { Cart } from "./cart/index.js";
import { ProductRepository } from "./catalog/index.js";
import { CustomerRepository } from "./customers/index.js";
import { connect, migrate } from "./db/index.js";
import { createEventBus } from "./events/index.js";
import { OutboxNotifier, registerNotifications } from "./notifications/index.js";
import { money, systemClock } from "./shared/index.js";

export async function main(port = Number(process.env.PORT ?? 3000)): Promise<void> {
  const db = connect(process.env.DATABASE_URL ?? "memory://localhost/shop");
  migrate(db);
  const events = createEventBus();
  const products = new ProductRepository(db, events);
  const customers = new CustomerRepository(db);
  const billing: BillingDeps = { db, events, products, gateway: new FakeGateway(), clock: systemClock };
  const carts = new Map<string, Cart>();
  const notifier = new OutboxNotifier();
  registerNotifications(events, customers, notifier);

  await products.create({ sku: "MUG-01", name: "Coffee mug", price: money(1290), weightGrams: 350, tags: ["kitchen"] });
  await products.create({ sku: "TEE-01", name: "T-shirt", price: money(2490), weightGrams: 200, tags: ["apparel"] });

  const server = createApiServer({
    ...catalogRoutes(products),
    ...cartRoutes(carts),
    ...checkoutRoutes({ billing, customers, carts }),
  });
  server.listen(port, () => console.log(`demo-shop listening on http://localhost:${port}`));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}
