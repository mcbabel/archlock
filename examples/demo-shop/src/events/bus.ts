import type { DomainEvent, EventName, Handler } from "./types.js";

type AnyHandler = (event: DomainEvent) => void | Promise<void>;

export class EventBus {
  private readonly handlers = new Map<EventName, AnyHandler[]>();
  private readonly history: DomainEvent[] = [];

  subscribe<N extends EventName>(name: N, handler: Handler<N>): () => void {
    const wrapped = handler as unknown as AnyHandler;
    this.handlers.set(name, [...(this.handlers.get(name) ?? []), wrapped]);
    return () => {
      this.handlers.set(
        name,
        (this.handlers.get(name) ?? []).filter((h) => h !== wrapped),
      );
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    this.history.push(event);
    for (const handler of this.handlers.get(event.type) ?? []) {
      await handler(event);
    }
  }

  published(): readonly DomainEvent[] {
    return this.history;
  }
}

export function createEventBus(): EventBus {
  return new EventBus();
}
