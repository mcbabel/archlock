// The manual step of the demo: plan a `notifications` module and change `billing.markPaid`
// by editing the sketches.
import { readFileSync, writeFileSync } from "node:fs";

function edit(file, from, to) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(from)) throw new Error(`${file}: expected text not found`);
  writeFileSync(file, text.replace(from, to));
}

edit(
  "archlock/billing.arch.py",
  "    payment: PaymentRef,\n) -> Promise[Invoice]: ...",
  "    payment: PaymentRef,\n    paidAt: Date,\n) -> Promise[Invoice]:\n    # must: use paidAt from the payment provider, not the server clock\n    ...",
);
edit(
  "archlock/demo_shop.arch.py",
  '"events", "shared"]',
  '"events", "notifications", "shared"]',
);
writeFileSync(
  "archlock/notifications.arch.py",
  `"""Notifications: tell customers what happened to their orders."""

__module__ = "notifications"
__paths__ = ["src/notifications/**"]
__entry__ = "src/notifications/index.ts"
__depends_on__ = ["customers", "events", "shared"]

class Channel(Enum):
    Email = ...
    Sms = ...

class Message(Protocol):
    body: string
    channel: Channel
    subject: string
    to: string

class Notifier(Protocol):
    def send(self, message: Message) -> Promise[void]: ...

class OutboxNotifier(Notifier):
    outbox: Readonly['Message[]']
    async def send(self, message: Message) -> Promise[void]: ...

def invoicePaidMessage(customer: Customer, invoiceId: InvoiceId, paidAt: Date) -> Message: ...

# must: send exactly one message per paid invoice
def registerNotifications(events: EventBus, customers: CustomerRepository, notifier: Notifier) -> '() => void': ...
`,
);
console.log("Edited archlock/billing.arch.py and archlock/demo_shop.arch.py, created archlock/notifications.arch.py");
