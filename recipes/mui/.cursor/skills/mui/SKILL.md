---
name: mui
description: >-
  MUI (Material UI) setup for this SPA: MuiThemeProvider, ThemeProvider, and
  theme tokens. Use when wrapping the app with the design system or editing theme.
---

# UI kit (MUI)

This skill is present because the **UI recipe** is installed.

## Setup

- Theme tokens: `src/configs/theme.ts`
- App wrapper: `src/app/mui-theme-provider.tsx` (`ThemeProvider` + `CssBaseline`)
- Primitives: `src/components/ui/` (real files — one kebab-case file per primitive, barrel in `index.ts`)

Keep `MuiThemeProvider` around `<App />` in `src/main.tsx`. Do not mount a second `ThemeProvider` in feature screens unless you are intentionally overriding theme.

## Imports

Prefer the project wrappers over the vendor package when a wrapper exists:

```ts
import { Button, TextField } from "@/components/ui";
```

When a primitive needs extra props or app-specific defaults, edit its file under `components/ui/` — do not import `@mui/material` from feature screens.

## Theme

Edit design tokens in `src/configs/theme.ts` (`createTheme`) and pass them through `ThemeProvider` (already wired in `MuiThemeProvider`).
