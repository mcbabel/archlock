import { createServer, type Server } from "node:http";
import { json, type Route } from "./http.js";

export function createApiServer(routes: Record<string, Route>): Server {
  return createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const route = routes[`${req.method} ${url.pathname}`];
    if (!route) return json(res, 404, { error: "not found" });
    route(req, res, url.searchParams).catch((error: unknown) => {
      json(res, 500, { error: error instanceof Error ? error.message : String(error) });
    });
  });
}
