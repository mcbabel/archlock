export { type Clock, fixedClock, systemClock } from "./clock.js";
export {
  type CartId,
  type CustomerId,
  type InvoiceId,
  newId,
  type ProductId,
  type ShipmentId,
} from "./ids.js";
export { add, type Currency, formatMoney, type Money, money, multiply, sum } from "./money.js";
export { err, ok, type Result, unwrap } from "./result.js";
