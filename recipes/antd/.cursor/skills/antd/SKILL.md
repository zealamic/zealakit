---
name: antd
description: >-
  Ant Design setup for this SPA: AntdThemeProvider, ConfigProvider, and theme
  tokens. Use when wrapping the app with the design system or editing theme.
---

# UI kit (Ant Design)

This skill is present because the **UI recipe** is installed.

## Setup

- Theme tokens: `src/configs/theme.ts`
- App wrapper: `src/app/antd-theme-provider.tsx` (`ConfigProvider` + Ant Design `App` for static `message` / `modal` APIs)
- Primitives: `src/components/ui/` (real files — one kebab-case file per primitive, barrel in `index.ts`)

Keep `AntdThemeProvider` around `<App />` in `src/main.tsx`. Do not mount a second `ConfigProvider` in feature screens unless you are intentionally overriding theme.

## Imports

Prefer the project wrappers over the vendor package when a wrapper exists:

```ts
import { Button, Input } from "@/components/ui";
```

When a primitive needs extra props or app-specific defaults, edit its file under `components/ui/` — do not import `antd` from feature screens.

## Theme

Edit design tokens in `src/configs/theme.ts` and pass them through `ConfigProvider` (already wired in `AntdThemeProvider`).
