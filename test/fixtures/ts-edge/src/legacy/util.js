export function merge(a, b = {}) {
  return { ...a, ...b };
}
export async function load(url) {
  const mod = await import("../c/alpha");
  return mod;
}
