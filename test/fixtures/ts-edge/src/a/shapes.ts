import { shared } from "../b";

export interface Point {
  x: number;
  y: number;
}
export interface Point {
  z?: number;
  readonly [key: string]: number | undefined;
}

export abstract class Shape<T extends Point = Point> {
  abstract area(): number;
  get name(): string {
    return shared;
  }
  set scale(v: number) {}
  static from(p: Point): Shape {
    throw new Error();
  }
  protected hidden(): void {}
  onResize?: (w: number) => void;
}
