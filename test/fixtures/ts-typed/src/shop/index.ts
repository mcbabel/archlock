import { load } from "../db";
import { missing } from "not-installed";

export const LIMIT = 10;
export const names = ["a", "b"];
export const broken = missing();

export function rows() {
  return load();
}

export function sum(xs: number[], start = 0) {
  return xs.reduce((a, b) => a + b, start);
}

export class Cart {
  size = 3;
  get double() {
    return this.size * 2;
  }
  open(force = false) {
    return force ? "open" : null;
  }
}
