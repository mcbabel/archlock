import type { CustomerId } from "../shared/index.js";

export interface Address {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: CustomerId;
  email: string;
  name: string;
  address: Address;
  marketingConsent: boolean;
  createdAt: Date;
}
