export * as helpers from "./helpers";
export { shared } from "../b";
export { Shape, type Point } from "./shapes";
export default class Widget {
  constructor(public readonly id: string, private secret: number) {}
  render(): string {
    return this.id;
  }
}
