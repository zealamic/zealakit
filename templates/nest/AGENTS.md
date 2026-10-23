# Agent instructions

This project uses Cursor skills and rules for **where files go** and **how to write NestJS + DDD code**. Recipe libraries are examples only.

## Always follow

- **Structure:** [.cursor/skills/structure-ddd/SKILL.md](.cursor/skills/structure-ddd/SKILL.md) — hexagonal layers, feature placement, DI ports/adapters
- **NestJS:** [.cursor/skills/nestjs/SKILL.md](.cursor/skills/nestjs/SKILL.md) — modules, DI, testing, API / ORM patterns
- **TypeScript:** [.cursor/skills/typescript/SKILL.md](.cursor/skills/typescript/SKILL.md) — types, tsconfig, narrowing
- **JavaScript:** [.cursor/skills/javascript/SKILL.md](.cursor/skills/javascript/SKILL.md) — modules, async, idioms
- **Rules:** [.cursor/rules/](.cursor/rules/)

Entry: `src/bootstrap/main.ts`. Path alias: `@/*` → `src/*`. Keep `.js` extensions under `nodenext` (e.g. `@/application/.../handler.js`).
