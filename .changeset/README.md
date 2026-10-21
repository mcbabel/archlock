# Changesets

Every pull request that changes what users get adds a changeset:

```bash
pnpm changeset
```

Pick the bump (patch: fixes; minor: features; major: breaking changes, including breaking
changes to the sketch format or the `--json` schema) and write one or two sentences for the
changelog. The release workflow turns pending changesets into a "Version Packages" pull request;
merging it publishes to npm.
