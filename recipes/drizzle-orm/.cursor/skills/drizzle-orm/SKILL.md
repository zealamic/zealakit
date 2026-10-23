---
name: drizzle-orm
description: >-
  Drizzle ORM persistence for this hexagonal server app (NestJS or Hono). Use
  when choosing a DB dialect/driver, editing drizzle schemas, the DRIZZLE token,
  repository adapters, or migrations. Does not belong in domain/.
---

# Drizzle ORM

This skill is present because the **drizzle-orm** recipe is installed.

Persistence wiring lives under `src/infrastructure/persistence/drizzle/`. Domain ports and application handlers stay ORM-free. **No dialect or driver is pre-selected.**

## Choose a dialect + driver (required before boot / migrations)

1. Install a client driver, for example `pg`, `mysql2`, or `better-sqlite3`.
2. Implement `createDrizzleClient()` in `drizzle.client.ts` (import the matching `drizzle-orm/*` entry).
3. Define tables in `schema.ts` with the matching core package:
   - Postgres → `drizzle-orm/pg-core`
   - MySQL → `drizzle-orm/mysql-core`
   - SQLite → `drizzle-orm/sqlite-core`
4. For drizzle-kit, set `DB_DIALECT` (`postgresql` | `mysql` | `sqlite` | …) and `DATABASE_URL`.

## Placement

| Artifact | Path |
| --- | --- |
| Nest module | `infrastructure/persistence/drizzle/drizzle.module.ts` |
| Hono bootstrap re-export | `infrastructure/persistence/drizzle/drizzle.bootstrap.ts` |
| Client factory | `infrastructure/persistence/drizzle/drizzle.client.ts` |
| DI / composition token | `infrastructure/persistence/drizzle/drizzle.token.ts` (`DRIZZLE`) |
| Table schemas | `infrastructure/persistence/drizzle/schema.ts` |
| Kit config | `drizzle.config.ts` (repo root) |
| Repository adapter | `infrastructure/persistence/<feature>/*.repository.adapter.ts` |

Scaffold leaves Nest `DrizzlePersistenceModule` / Hono `createDrizzleClient` **commented out** in the composition root so the app boots without a driver. Uncomment after env + driver are ready.

## Critical rules

1. **Domain has zero Drizzle imports** — no `drizzle-orm` / table schemas in `domain/`.
2. **Inject or pass the client** — Nest adapters use `@Inject(DRIZZLE)`; Hono adapters receive the client from the composition root.
3. **Schemas are persistence models** — map rows ↔ aggregates in persistence mappers.
4. **Migrations via drizzle-kit** — `pnpm db:generate` / `pnpm db:migrate` after env is set.
5. **Do not commit a default dialect** — leave `schema.ts` / `drizzle.client.ts` as stubs until the DB is chosen.

## Wire a feature adapter (checklist)

```text
[ ] Install driver + implement createDrizzleClient()
[ ] Add tables in schema.ts with the correct *-core import
[ ] Set DB_DIALECT + DATABASE_URL for drizzle-kit
[ ] Pass DRIZZLE / client into <name>.repository.adapter.ts
[ ] Keep domain/<feature>/repositories/<name>.repository.ts as the port
[ ] Nest: module + token bind; Hono: wire in bootstrap/modules
```

## Anti-patterns

| Don’t | Do instead |
| --- | --- |
| Ship sqliteTable / better-sqlite3 in the recipe | Stubs + install dialect/driver in the app |
| Import `schema.ts` from domain | Ports + adapter mapping |
| `drizzle-item.repository.ts` | `item.repository.adapter.ts` |

## Related

- Layer rules → template skill `.cursor/skills/structure-ddd/SKILL.md`
