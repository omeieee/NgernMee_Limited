# Packages

Every package in this directory is a **deep module**: a lot of behaviour behind a small public interface.

## Layout

```
src/packages/<name>/
  index.ts        ← public entry point. Import this from outside.
  client.ts       ← another public entry point (packages may expose several).
  lib/            ← implementation: private, free to import each other.
  tests/          ← co-located tests (private, exercise package via entry points).
```

## The Rules

1. **Entry-point boundary**: App code and other packages may only import a package's root entry point files, never anything inside `lib/` or subfolders.
2. **Intra-package freedom**: A package's own files in `lib/` can import each other freely.
3. **Tests through entry points**: Tests in `tests/` must exercise the module through its public entry points, never reaching directly into `lib/`.
4. **No barrel sprawl**: Avoid giant barrel files that re-export whole subtrees. Expose focused entry points (`index.ts`, `client.ts`).

## Verification

Run boundary checks:

```bash
npm run lint:boundaries
```
