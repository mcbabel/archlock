import { randomUUID } from "node:crypto";

declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };

export type ProductId = Brand<string, "ProductId">;
export type CustomerId = Brand<string, "CustomerId">;
export type CartId = Brand<string, "CartId">;
export type InvoiceId = Brand<string, "InvoiceId">;
export type ShipmentId = Brand<string, "ShipmentId">;

export function newId<T extends string>(prefix: string): T {
  return `${prefix}_${randomUUID().slice(0, 8)}` as T;
}
