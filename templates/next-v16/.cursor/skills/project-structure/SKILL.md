---
name: project-structure
description: >-
  Defines Next.js App Router folder layout, [locale] routing, server/client
  component export rules, shared widgets, handlers, and naming for this
  next-v16 template. Use when adding pages, placing components, choosing
  server.tsx vs client.tsx, wiring i18n, or answering “where does this belong?”.
---

# Project structure

Opinionated App Router layout for a multilingual Next.js app. Prefer **route-group modules** over dumping UI into a global `components/` folder.

**Naming hard rule:** all source **file and folder** names use **kebab-case** (including `.tsx`). React component **identifiers** use **PascalCase**. Never `HeroBanner.tsx` — use `hero-banner/` exporting `HeroBanner`.

Path alias: `@/*` → `src/*`.

## When to apply

- “Where should I put X?”
- New page / route group / shared widget
- Choosing SSR vs CSR export files
- Naming CSS modules and component folders

Do **not** use this skill to choose a UI kit. Recipes may add libraries into the same folders.

This app is already structured. Do **not** reshape into `src/pages/` or a Pages Router tree.

---

## Root

```
project/
├── public/
├── src/
├── next.config.ts
├── package.json
└── <tooling configs>
```

---

## `src/` tree

```
src/
├── proxy.ts                      # next-intl middleware (locale prefix)
├── app/
│   ├── layout.tsx                # Root shell: fonts, globals.css, <html>/<body>
│   ├── globals.css
│   └── [locale]/
│       ├── layout.tsx            # Validate locale + NextIntlClientProvider
│       ├── _shared/              # Cross-page widgets (often server + client)
│       ├── (site)/               # Public marketing / site route group
│       │   ├── layout.tsx        # Site chrome (header, nav)
│       │   ├── page.tsx          # Home
│       │   ├── about-us/page.tsx
│       │   ├── _handlers/        # Fetch + transform data for this group
│       │   └── _components/      # Widgets owned by this route group
│       ├── (entry)/              # Optional — unauthenticated entry flows
│       ├── (console)/            # Optional — authenticated app / dashboard
│       └── (landing)/            # Optional — campaign / one-off landing pages
├── i18n/
│   ├── request.ts
│   ├── routing.ts
│   ├── navigation.ts
│   ├── messages.ts
│   ├── get-translation.ts        # Server helper
│   ├── use-translations.ts       # Client helper
│   └── locales/<lang>/*.json
```

---

## Route groups vs shared

| Location | Role |
| --- | --- |
| `app/[locale]/(site)/` | Default public area: pages + `_components` + `_handlers` |
| `app/[locale]/(site)/_components/<name>/` | UI used primarily by this group’s pages |
| `app/[locale]/_shared/<name>/` | UI reused across **multiple pages / groups**; often needs both SSR and CSR exports |
| `app/[locale]/layout.tsx` | Locale boundary + i18n provider only |
| `app/layout.tsx` | Global Next shell (`html` / `body` / fonts / CSS) |

Route group folders `(…)` do **not** appear in the URL. Each group may have its own `layout.tsx`, `_components/`, and `_handlers/`.

### Optional route groups

`(site)` is the default. The groups below are **optional** — keep or grow them only when the product needs that surface. Stubs in the template are starting points, not required features.

| Group | Use when | Typical routes | Layout chrome |
| --- | --- | --- | --- |
| `(site)` | Always (default) | `/`, `/about-us`, … | Public header / footer / marketing nav |
| `(entry)` | Auth / onboarding before the app | `/auth/login`, `/auth/sign-up`, forgot-password, … | Minimal entry shell (logo, locale, no console nav) |
| `(console)` | Signed-in product UI | `/console`, settings, resource CRUD, … | Sidebar / topbar / app frame |
| `(landing)` | Campaign or one-off pages that should **not** inherit `(site)` chrome | `/campaign-example`, promo slugs, … | Sparse or custom landing layout (or none) |

**Rules for optional groups**

- Create `(entry)` / `(console)` / `(landing)` only when you need a **different layout boundary** from `(site)`.
- Do not put login screens under `(site)` if they need a different chrome — use `(entry)`.
- Do not put dashboard screens under `(site)` — use `(console)`.
- Do not force campaign pages through the marketing header — use `(landing)`.
- Cross-group widgets (e.g. locale switcher) stay in `[locale]/_shared/`.
- Delete unused optional groups rather than leaving empty placeholders in a real app.

Example shapes (optional):

```
(entry)/
├── layout.tsx
└── auth/
    ├── login/page.tsx
    └── sign-up/page.tsx

(console)/
├── layout.tsx
└── console/page.tsx

(landing)/
└── campaign-example/page.tsx
```

---

## Component folder contract

Each widget folder under `_components/` or `_shared/`:

```
<widget-name>/
├── template.tsx                         # Presentational view (no "use client" unless the view itself needs it)
├── server.tsx                           # Optional SSR export entry
├── client.tsx                           # Optional CSR export entry
├── skeleton.tsx                         # Loading UI
└── <page-or-scope>-<widget-name>.module.css   # Optional scoped CSS
```

### Hard rules

1. **`server.tsx` and `client.tsx` are export entries only.**
   - Pages / layouts import from `./server` or `./client`.
   - Files **inside the same folder must not import both** `server.tsx` and `client.tsx`.
2. **`template.tsx` owns the view.**
   - SSR / SEO path: `server.tsx` imports `template.tsx` and prepares data.
   - CSR / lighter server path: `client.tsx` imports `template.tsx` (and may fetch on the client).
3. **Usually create only one of `server.tsx` or `client.tsx`.**
   - SEO-critical / first-paint content → `server.tsx`
   - Deferred / interactive / secondary blocks → `client.tsx`
4. **Use `_shared/` when the same widget is reused in multiple places and some call sites need SSR while others need CSR.**
   - Then provide **both** `server.tsx` and `client.tsx`.
   - Still: never import both from a sibling file; call sites choose one entry.
5. **`skeleton.tsx`** is the loading fallback (often with `Suspense`).
6. **CSS module name:** `<page>-<component-name>.module.css` for page/group widgets (e.g. `home-hero-banner.module.css`), or `shared-<component-name>.module.css` for `_shared/`.
   - Skip the CSS file when styling comes from a library (MUI, Tailwind, …).

### Examples in this template

| Widget | Mode | Why |
| --- | --- | --- |
| `(site)/_components/hero-banner` | `server.tsx` only | SEO headline on homepage |
| `(site)/_components/solutions` | `client.tsx` only | Deferred section, lighter server work |
| `[locale]/_shared/locale-switcher` | both exports | Header SSR today; reusable inside client islands later |

Import examples:

```ts
import { HeroBanner } from "./_components/hero-banner/server";
import { Solutions } from "./_components/solutions/client";
import { LocaleSwitcher } from "../_shared/locale-switcher/server";
// import { LocaleSwitcher } from "../_shared/locale-switcher/client";
```

---

## `_handlers/`

Route-group data access: fetch, map, and return view models for pages / server components.

```
(site)/_handlers/index.ts
```

- Keep API / mock fetch here — not inside `template.tsx`.
- Server components may `await` handlers directly.
- Client components may call handler functions only if they are browser-safe (no `server-only` secrets). Prefer dedicated client fetchers when logic diverges.

---

## i18n

| File | Role |
| --- | --- |
| `i18n/routing.ts` | Locales + default locale |
| `i18n/navigation.ts` | Locale-aware `Link`, `useRouter`, … |
| `i18n/request.ts` | Load messages for the active locale |
| `i18n/get-translation.ts` | Server: `await getTranslation(["common", "action"])` |
| `i18n/use-translations.ts` | Client: `useTranslations(["common"])` |
| `i18n/locales/<lang>/*.json` | Namespaces: `common`, `action`, `field`, `message` |

Keys use `namespace:PATH.TO.KEY` (e.g. `common:SITE.NAV.HOME`). Add every new key to **all** languages.

---

## Naming conventions

| What | Case | Example |
| --- | --- | --- |
| Folders | `kebab-case` | `hero-banner/`, `about-us/` |
| Source files | `kebab-case` | `server.tsx`, `home-hero-banner.module.css` |
| Component / type identifiers | `PascalCase` | `HeroBanner`, `SolutionsTemplate` |
| Hooks / functions | `camelCase` | `getHomeHeroBanner` |

**Never:** `PascalCase.tsx` filenames, importing both `server` and `client` from the same sibling module, putting page-only widgets in `_shared/` “just in case”.

---

## TypeScript

Prefer **functional** style and **`type` aliases**, not `interface`. Use `import type` for type-only imports.

---

## Placement decision tree

1. **URL / screen?** → `app/[locale]/<group>/<route>/page.tsx`
   - Public marketing → `(site)/`
   - Auth / onboarding → `(entry)/` *(optional)*
   - Signed-in app → `(console)/` *(optional)*
   - Campaign / one-off → `(landing)/` *(optional)*
2. **UI for one route group?** → `<group>/_components/<widget>/`
3. **UI reused across pages/groups, possibly SSR + CSR?** → `[locale]/_shared/<widget>/`
4. **SEO / first paint?** → export via `server.tsx`
5. **Deferred / interactive?** → export via `client.tsx`
6. **Loading state?** → `skeleton.tsx` + `Suspense`
7. **Fetch/transform for the group?** → `<group>/_handlers/`
8. **Copy?** → `i18n/locales/<lang>/`

---

## New page checklist

```
[ ] Add app/[locale]/<group>/<route>/page.tsx
[ ] Register nav Link via @/i18n/navigation (no raw locale prefixes)
[ ] Add locale keys in every language
[ ] Put page widgets under <group>/_components/ (or _shared/ if reused)
[ ] Choose server.tsx OR client.tsx (both only for _shared dual use)
[ ] Add skeleton.tsx when the section suspends or loads async
[ ] Name CSS <page>-<component>.module.css when using CSS modules
[ ] Keep template.tsx free of export-entry imports
```

---

## Anti-patterns

| Don’t | Do instead |
| --- | --- |
| Import `./server` from `./client` (or vice versa) | Call sites import one entry; both wrap `template.tsx` |
| Put `"use client"` on `template.tsx` by default | Keep template presentational; client entry owns interactivity |
| Dump all widgets in `_shared/` | `_shared/` only for true multi-page reuse |
| `HeroBanner.tsx` PascalCase file | `hero-banner/server.tsx` exporting `HeroBanner` |
| Magic `/en/...` paths in JSX | `Link` / `redirect` from `@/i18n/navigation` |
| Fetch inside `template.tsx` | `_handlers/` + server/client entry |
| Login under `(site)` with marketing chrome | `(entry)/auth/...` with its own layout |
| Dashboard under `(site)` | `(console)/...` with app chrome |
| Campaign page forced through site header | `(landing)/...` with sparse/custom layout |
| Keep empty optional groups forever | Delete unused `(entry)` / `(console)` / `(landing)` stubs |
| `html`/`body` in `[locale]/layout.tsx` when root layout exists | Root `app/layout.tsx` owns the document shell |
| `NextIntlClientProvider` in root layout | Keep provider in `app/[locale]/layout.tsx` |

---

## Related

- UI generation / refactor / performance → [.cursor/skills/reactjs/SKILL.md](../reactjs/SKILL.md)
- Forms → a form recipe may add a skill under `.cursor/skills/`
