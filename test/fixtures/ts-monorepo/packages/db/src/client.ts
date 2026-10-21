import postgres from "postgres";

export interface Client {
  query<T>(sql: string): Promise<T[]>;
  close(): Promise<void>;
}

export function createClient(url: string): Client {
  const sql = postgres(url);
  return { query: async () => [], close: async () => sql.end() };
}
