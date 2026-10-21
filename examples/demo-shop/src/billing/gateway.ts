import type { Money } from "../shared/index.js";

export interface PaymentRef {
  provider: string;
  reference: string;
}

export interface PaymentGateway {
  charge(amount: Money, description: string): Promise<PaymentRef>;
  refund(payment: PaymentRef): Promise<void>;
}

/** A gateway that always succeeds. Used in development and tests. */
export class FakeGateway implements PaymentGateway {
  readonly charges: { amount: Money; description: string }[] = [];

  async charge(amount: Money, description: string): Promise<PaymentRef> {
    this.charges.push({ amount, description });
    return { provider: "fake", reference: `ch_${this.charges.length}` };
  }

  async refund(_payment: PaymentRef): Promise<void> {}
}
