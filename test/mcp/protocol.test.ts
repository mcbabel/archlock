import { describe, expect, it } from "vitest";
import { createTools, handleMessage } from "../../src/mcp/server.js";

const tools = createTools("/nonexistent");

describe("MCP protocol handling", () => {
  it("negotiates the protocol version", async () => {
    const known = await handleMessage(tools, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t" } },
    });
    expect(known).toMatchObject({ id: 1, result: { protocolVersion: "2025-03-26" } });
    const unknown = await handleMessage(tools, {
      jsonrpc: "2.0",
      id: 2,
      method: "initialize",
      params: { protocolVersion: "1999-01-01" },
    });
    expect(unknown).toMatchObject({ result: { protocolVersion: "2025-11-25" } });
  });

  it("does not answer notifications", async () => {
    expect(
      await handleMessage(tools, { jsonrpc: "2.0", method: "notifications/initialized" }),
    ).toBeNull();
    expect(await handleMessage(tools, { jsonrpc: "2.0", method: "tools/list" })).toBeNull();
  });

  it("reports unknown methods, unknown tools and malformed requests", async () => {
    expect(await handleMessage(tools, { jsonrpc: "2.0", id: 3, method: "resources/list" })).toEqual(
      {
        jsonrpc: "2.0",
        id: 3,
        error: { code: -32601, message: "method not supported: resources/list" },
      },
    );
    expect(
      await handleMessage(tools, {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "deploy" },
      }),
    ).toMatchObject({
      error: { code: -32602, message: expect.stringContaining('unknown tool "deploy"') },
    });
    expect(await handleMessage(tools, { id: 5, method: "ping" })).toMatchObject({
      id: 5,
      error: { code: -32600 },
    });
  });

  it("a tool that fails reports it as a tool error, not a protocol error", async () => {
    const result = await handleMessage(tools, {
      jsonrpc: "2.0",
      id: 6,
      method: "tools/call",
      params: { name: "check", arguments: {} },
    });
    expect(result).toMatchObject({ id: 6, result: { isError: true } });
  });
});
