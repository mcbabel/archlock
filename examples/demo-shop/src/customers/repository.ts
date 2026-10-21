import type { Database, Table } from "../db/index.js";
import { type Clock, type CustomerId, newId, systemClock } from "../shared/index.js";
import type { Address, Customer } from "./customer.js";

export class CustomerRepository {
  private readonly table: Table<Customer>;

  constructor(
    db: Database,
    private readonly clock: Clock = systemClock,
  ) {
    this.table = db.table<Customer>("customers");
  }

  register(email: string, name: string, address: Address, marketingConsent = false): Customer {
    const normalized = email.trim().toLowerCase();
    if (this.findByEmail(normalized)) throw new Error(`customer ${normalized} already exists`);
    const customer: Customer = {
      id: newId<CustomerId>("cus"),
      email: normalized,
      name,
      address,
      marketingConsent,
      createdAt: this.clock.now(),
    };
    return this.table.insert(customer);
  }

  get(id: CustomerId): Customer | undefined {
    return this.table.get(id);
  }

  findByEmail(email: string): Customer | undefined {
    return this.table.find((c) => c.email === email.trim().toLowerCase())[0];
  }
}
