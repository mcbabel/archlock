export function emit(name: string, payload?: unknown): void {}

/** Overloads */
export function on(name: "invoice.paid", handler: (e: { id: string }) => void): void;
export function on(name: string, handler: (e: unknown) => void): void;
export function on(name: string, handler: (e: never) => void): void {}

export const EVENT_NAMES = ["invoice.paid"] as const;
