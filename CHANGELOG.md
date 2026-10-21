# archlock

## 0.1.2

### Patch Changes

- 992d67b: `init`, `stats`, the generated `archlock/README.md` and the `stats --badge` badge no longer show a compression ratio for projects below 300 lines of code or when the sketches are longer than the code; a short note takes its place. The npm package's homepage is now the landing page.

## 0.1.1

### Patch Changes

- 1e73012: The GitHub Action is ready for the GitHub Marketplace: it is listed as "archlock architecture lockfile" with lock branding in blue (use it as before, `uses: mcbabel/archlock@v0`). Releases are published with npm Trusted Publishing and provenance.

## 0.1.0

### Minor Changes

- 586da73: First release: `init`, `check`, `accept`, `diff`, `push`, `stats`, `graph` and `mcp` for TypeScript/JavaScript and Python, the GitHub Action, and the agent skill.
