# Agent instructions (zealakit kit)

This repo builds and maintains **zealakit** — a recipe-based scaffolding CLI.
It is **not** a consumer frontend app. Skills under `templates/` and `recipes/` are for *generated* projects.

## Always follow

- **Kit architecture:** [.cursor/skills/zealakit/SKILL.md](.cursor/skills/zealakit/SKILL.md) — layout, registry, scaffolder, conventions
- **Extending:** [.cursor/skills/zealakit/extending.md](.cursor/skills/zealakit/extending.md) — add templates/recipes/overlays
- **Rules:** [.cursor/rules/](.cursor/rules/)

## Quick map

| Area | Path |
| --- | --- |
| CLI | `src/` |
| Templates | `templates/` (`vite-react`, `next`, `nest`, `hono`) |
| Recipes | `recipes/` |
| E2E | `scripts/test-e2e-pack.ts` |
| Dep monitor | `monitor/` (`pnpm monitor`) |
| Scopes / categories | `src/constants.ts` |

Path alias `@/*` applies inside **templates**, not the kit `src/` CLI.
