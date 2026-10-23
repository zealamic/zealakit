---
name: type-orm
description: >-
  TypeORM persistence for this hexagonal server app (NestJS or Hono). Use when
  configuring DataSource / TypeOrmModule, choosing a DB driver, decorating
  orm-entities, or writing repository adapters. Does not belong in domain/.
---

# TypeORM

This skill is present because the **type-orm** recipe is installed.

Persistence wiring lives under `src/infrastructure/persistence/typeorm/`. Domain ports and application handlers stay ORM-free. **No database driver is pre-selected** — install one when you know the target DB.

## Choose a driver (required before boot)

1. Install a driver package, for example:
   - Postgres → `pg`
   - MySQL → `mysql2`
   - SQLite → `better-sqlite3`
2. Set env:
   - `DB_TYPE` — TypeORM driver name (`postgres`, `mysql`, `better-sqlite3`, …)
   - `DATABASE_URL` **or** `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME`
   - optional `DB_SYNCHRONIZE=true` for local only (never in production)
3. Options factory:
   - Nest → `createTypeOrmModuleOptions()` in `typeorm.options.ts`
   - Hono → `createTypeOrmDataSourceOptions()` / `createTypeOrmDataSource()`

## Placement

| Artifact | Path |
| --- | --- |
| Nest root module | `infrastructure/persistence/typeorm/typeorm.module.ts` |
| Hono DataSource factory | `infrastructure/persistence/typeorm/typeorm.data-source.ts` |
| Connection options | `infrastructure/persistence/typeorm/typeorm.options.ts` |
| Feature row models | `infrastructure/persistence/<feature>/entities/*.orm-entity.ts` |
| Repository adapter | `infrastructure/persistence/<feature>/*.repository.adapter.ts` |
| Nest feature binding | `bootstrap/modules/<feature>.module.ts` |
| Hono feature binding | `bootstrap/modules/<feature>.ts` |

Scaffold leaves Nest `TypeormPersistenceModule` / Hono `createTypeOrmDataSource` **commented out** in the composition root so the app boots without a driver. Uncomment after env + driver are ready.

## Critical rules

1. **Domain has zero TypeORM imports** — no `@Entity`, `Repository`, or `DataSource` in `domain/` or application handlers.
2. **Decorate persistence models only** — put `@Entity()` / columns on `*.orm-entity.ts`, not on aggregates.
3. **Adapters implement ports** — inject `Repository` / `DataSource` inside `*.repository.adapter.ts`; map to/from domain via persistence mappers.
4. **Feature registration** — Nest: `TypeOrmModule.forFeature([...])` in the feature module; Hono: pass `DataSource` into the adapter from the composition root.
5. **Do not commit a default driver** — keep recipe packages driver-agnostic; add `pg` / `mysql2` / `better-sqlite3` in the app when the DB is decided.

## Wire a feature adapter (checklist)

```text
[ ] Install DB driver + set DB_TYPE / DATABASE_URL (or host credentials)
[ ] Decorate infrastructure .../entities/<name>.orm-entity.ts with TypeORM
[ ] Use Repository / DataSource in <name>.repository.adapter.ts
[ ] Keep domain/<feature>/repositories/<name>.repository.ts as the port
[ ] Nest: TypeOrmModule.forFeature + token bind; Hono: new Adapter(dataSource) in bootstrap/modules
```

## Anti-patterns

| Don’t | Do instead |
| --- | --- |
| `@Entity()` on a domain aggregate | Decorate `*.orm-entity.ts` only |
| Import `typeorm` from a handler | Call the port; adapter owns TypeORM |
| Hardcode sqlite/postgres in the recipe | Env + install driver in the generated app |
| `typeorm-item.repository.ts` | `item.repository.adapter.ts` |

## Related

- Layer rules → `.cursor/skills/structure-ddd/SKILL.md`
