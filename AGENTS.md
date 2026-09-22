# Agent Instructions & Guidelines

Packages are deep modules: see [src/packages/README.md](./src/packages/README.md) before adding or importing one.
All domain terms and boundaries should conform to [CONTEXT.md](./CONTEXT.md) and recorded ADRs in `docs/adr/`.
Before modifying, building, or styling UX/UI components, read and strictly follow [PROTOTYPE_STYLE_GUIDE.md](./PROTOTYPE_STYLE_GUIDE.md) for design tokens, neomorphic surfaces, micro-interactions, color palettes (day/night mode), and device layouts.
Run tests with `npm test` and verify architectural boundaries with `npm run lint:boundaries`.
