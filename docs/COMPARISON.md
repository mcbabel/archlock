# How archlock compares

| Tool | What it does well | What archlock adds |
|---|---|---|
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser), [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries), [Nx module boundaries](https://nx.dev/features/enforce-module-boundaries) | Rich, configurable import rules for JS/TS. | Public signatures as part of the contract; rules live in a readable sketch next to the API they protect; Python support; the way back from sketch to code (`push`). |
| [import-linter](https://github.com/seddonym/import-linter) | Layer and independence contracts for Python imports. | The same idea across languages, plus public APIs and signatures. |
| [API Extractor](https://api-extractor.com) | Precise `.api.md` reports of a TypeScript package's API, checked in CI. archlock borrows its report-in-the-repo workflow. | Per module inside one repository, includes dependencies, meant to be edited by humans and agents, works for Python. |
| [Spec Kit](https://github.com/github/spec-kit) and other spec-driven tools | Prose specifications that guide an agent from spec to code. | Code-shaped instead of prose, both directions, enforced in CI. |
| Architecture diagram and code-map tools | Views of a codebase for people or agents. | Not a view but an enforced contract that fails CI on drift. |

These tools fit together: many teams will want detailed lint rules *and* a reviewed sketch.
