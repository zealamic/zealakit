---
name: mikro-orm
description: >-
  MikroORM persistence for this hexagonal server app (NestJS or Hono). Use when
  configuring MikroORM, choosing a DB driver, decorating orm-entities, or
  writing repository adapters. Does not belong in domain/.
---

# MikroORM

This skill is present because the **mikro-orm** recipe is installed.

Persistence wiring lives under `src/infrastructure/persistence/mikro-orm/`. Domain ports and application handlers stay ORM-free. **No database driver is pre-selected.**

## Choose a driver (required before boot)

1. Install one driver package, for example `@mikro-orm/postgresql`, `@mikro-orm/mysql`, or `@mikro-orm/sqlite`.
2. Export it from `mikro-orm.driver.ts`:

```ts
export { PostgreSqlDriver as DatabaseDriver } from "@mikro-orm/postgresql";
```

3. Set connection env: `DATABASE_URL` and/or `DB_NAME` (+ `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` as needed).
4. Options are built in `mikro-orm.options.ts` via `createMikroOrmOptions()`.
5. Nest: `MikroOrmPersistenceModule`. Hono: `createMikroOrm()` from `mikro-orm.bootstrap.ts`.

## Placement

| Artifact | Path |
| --- | --- |
| Nest root module | `infrastructure/persistence/mikro-orm/mikro-orm.module.ts` |
| Hono bootstrap | `infrastructure/persistence/mikro-orm/mikro-orm.bootstrap.ts` |
| Driver export | `infrastructure/persistence/mikro-orm/mikro-orm.driver.ts` |
| Connection options | `infrastructure/persistence/mikro-orm/mikro-orm.options.ts` |
| Feature row models | `infrastructure/persistence/<feature>/entities/*.orm-entity.ts` |
| Repository adapter | `infrastructure/persistence/<feature>/*.repository.adapter.ts` |

Scaffold leaves Nest `MikroOrmPersistenceModule` / Hono `createMikroOrm` **commented out** in the composition root so the app boots without a driver. Uncomment after env + driver are ready.

## Critical rules

1. **Domain has zero MikroORM imports** — no `@Entity`, `EntityManager`, or driver packages in `domain/`.
2. **Decorators from legacy package** — with experimentalDecorators, import `@Entity` / `@Property` from `@mikro-orm/decorators/legacy`.
3. **Drivers from the driver package** — import `EntityManager` / `PostgreSqlDriver` from `@mikro-orm/postgresql` (or mysql/sqlite), not only from `@mikro-orm/core`.
4. **Adapters implement ports** — inject or pass `EntityManager` inside `*.repository.adapter.ts`; map via persistence mappers.
5. **Do not commit a default driver** — leave `DatabaseDriver` unset until the DB is chosen; boot throws a clear error until then.

## Wire a feature adapter (checklist)

```text
[ ] Install @mikro-orm/<driver> and export DatabaseDriver from mikro-orm.driver.ts
[ ] Set DATABASE_URL or DB_NAME (+ credentials)
[ ] Decorate infrastructure .../entities/<name>.orm-entity.ts with MikroORM legacy decorators
[ ] Use EntityManager / repo in <name>.repository.adapter.ts
[ ] Keep domain/<feature>/repositories/<name>.repository.ts as the port
[ ] Nest: module + token bind; Hono: await createMikroOrm() in composition root
```

## Anti-patterns

| Don’t | Do instead |
| --- | --- |
| Mikro imports in domain aggregates | Ports + infrastructure entities |
| Hardcode SqliteDriver in the recipe | `mikro-orm.driver.ts` + install matching package |
| `mikro-item.repository.ts` | `item.repository.adapter.ts` |

## Related

- Layer rules → template skill `.cursor/skills/structure-ddd/SKILL.md`
