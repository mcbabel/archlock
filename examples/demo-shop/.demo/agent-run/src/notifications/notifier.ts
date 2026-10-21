import type { Message } from "./message.js";

export interface Notifier {
  send(message: Message): Promise<void>;
}

/** Collects messages instead of sending them; a mail provider adapter would implement Notifier. */
export class OutboxNotifier implements Notifier {
  readonly outbox: Message[] = [];

  async send(message: Message): Promise<void> {
    this.outbox.push(message);
  }
}
