import type { Row } from "./types";

export class Database {
  private secret = 1;
  #pool: unknown[] = [];
  readonly url: string;
  static instances = 0;

  constructor(url: string) {
    this.url = url;
  }

  query<T extends Row>(sql: string, params?: unknown[]): Promise<T[]> {
    return Promise.resolve([]);
  }

  get connected(): boolean {
    return this.#pool.length > 0;
  }
}
