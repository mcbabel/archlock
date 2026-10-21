import type { Point } from "../a";

export const shared = "shared";
export function distance(p: Point): number {
  return Math.hypot(p.x, p.y);
}
export interface Callable {
  (x: number): string;
  new (x: string): Callable;
  label: string;
}
export enum Mode {
  "fast-path" = 1,
  Slow,
}
export namespace Legacy {
  export const value = 1;
}
