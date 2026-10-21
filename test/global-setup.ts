import { build, type Options } from "tsup";
import config from "../tsup.config.js";

/**
 * E2E tests run the bundled CLI, so build it once before the suite.
 * Set ARCHLOCK_SKIP_BUILD=1 when dist/ is already fresh (CI builds explicitly).
 */
export default async function setup(): Promise<void> {
  if (process.env.ARCHLOCK_SKIP_BUILD === "1") return;
  await build({ ...(config as Options), silent: true });
}
