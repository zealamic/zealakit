import type { RecipeConfig, Scope } from "../types.js";

export const recipes: Record<string, RecipeConfig> = {
  eslint: {
    id: "eslint",
    name: "ESLint",
    category: "linter",
    supportedScopes: ["client", "server", "hybrid"],
    exclusive: true,
    packages: {},
    devDependencies: {
      eslint: "^9.28.0",
      "@eslint/js": "^9.28.0",
      "typescript-eslint": "^8.33.1",
      "eslint-plugin-react-hooks": "^5.2.0",
      "eslint-plugin-react-refresh": "^0.4.20",
      globals: "^16.2.0",
    },
    scripts: {
      lint: "eslint .",
      "lint:fix": "eslint . --fix",
    },
  },
  biome: {
    id: "biome",
    name: "Biome",
    category: "linter",
    supportedScopes: ["client", "server", "hybrid"],
    exclusive: true,
    packages: {},
    devDependencies: {
      "@biomejs/biome": "^2.5.11",
    },
    scripts: {
      check: "biome check .",
      "check:write": "biome check --write .",
      format: "biome format --write .",
    },
  },
  zustand: {
    id: "zustand",
    name: "Zustand",
    category: "state",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      zustand: "^5.0.15",
    },
    devDependencies: {},
    scripts: {},
  },
  nanostores: {
    id: "nanostores",
    name: "Nanostores",
    category: "state",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      nanostores: "^1.5.2",
      "@nanostores/react": "^1.0.0",
    },
    devDependencies: {},
    scripts: {},
  },
  "client-shared-pieces": {
    id: "client-shared-pieces",
    name: "Client shared pieces",
    category: "utils",
    supportedScopes: ["client", "hybrid"],
    default: true,
    packages: {},
    devDependencies: {},
    scripts: {},
  },
  "hookform-zod": {
    id: "hookform-zod",
    name: "React Hook Form + Zod",
    category: "form",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      "react-hook-form": "^7.87.0",
      "@hookform/resolvers": "^5.9.1",
      zod: "^4.5.4",
    },
    devDependencies: {},
    scripts: {},
  },
  kyjs: {
    id: "kyjs",
    name: "Ky",
    category: "fetcher",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      ky: "^2.1.0",
    },
    devDependencies: {},
    scripts: {},
  },
  axios: {
    id: "axios",
    name: "Axios",
    category: "fetcher",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      axios: "^1.20.0",
    },
    devDependencies: {},
    scripts: {},
  },
  antd: {
    id: "antd",
    name: "Ant Design",
    category: "ui",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      antd: "^6.6.3",
    },
    devDependencies: {},
    scripts: {},
    fileTransforms: {
      "vite-react": [
        {
          file: "src/main.tsx",
          pattern: /import App from "\.\/app";/,
          replacement:
            'import App from "./app";\nimport { AntdThemeProvider } from "./app/antd-theme-provider";',
        },
        {
          file: "src/main.tsx",
          pattern: /<App \/>/g,
          replacement: "<AntdThemeProvider><App /></AntdThemeProvider>",
        },
      ],
    },
  },
  mui: {
    id: "mui",
    name: "MUI",
    category: "ui",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      "@mui/material": "^9.4.0",
      "@emotion/react": "^11.14.0",
      "@emotion/styled": "^11.14.0",
    },
    devDependencies: {},
    scripts: {},
    fileTransforms: {
      "vite-react": [
        {
          file: "src/main.tsx",
          pattern: /import App from "\.\/app";/,
          replacement:
            'import App from "./app";\nimport { MuiThemeProvider } from "./app/mui-theme-provider";',
        },
        {
          file: "src/main.tsx",
          pattern: /<App \/>/g,
          replacement: "<MuiThemeProvider><App /></MuiThemeProvider>",
        },
      ],
    },
  },
  "shadcn-ui": {
    id: "shadcn-ui",
    name: "shadcn/ui (core: base-ui | theme: vega | icons: lucide)",
    category: "ui",
    supportedScopes: ["client", "hybrid"],
    exclusive: true,
    packages: {
      shadcn: "^4.21.0",
      "@base-ui/react": "^1.8.0",
      "@fontsource-variable/inter": "^5.3.0",
      cn: "^0.2.6",
      "class-variance-authority": "^0.7.1",
      "lucide-react": "^1.43.0",
      tailwindcss: "^4.3.3",
      "@tailwindcss/vite": "^4.3.3",
      "tw-animate-css": "^1.4.0",
    },
    devDependencies: {},
    scripts: {},
    fileTransforms: {
      "vite-react": [
        {
          file: "src/lib/utils/index.ts",
          append: 'export * from "./other";',
        },
      ],
    },
  },
};

export function getRecipe(id: string): RecipeConfig | undefined {
  return recipes[id];
}

export function getAllRecipeIds(): string[] {
  return Object.keys(recipes);
}

export function getRecipesByCategory(category: RecipeConfig["category"]): RecipeConfig[] {
  return Object.values(recipes).filter((recipe) => recipe.category === category);
}

export function isDefaultRecipeSupportedForScope(recipe: RecipeConfig, scope: Scope): boolean {
  if (!recipe.default) {
    return false;
  }

  if (recipe.supportedScopes === "all") {
    return true;
  }

  if (scope === "hybrid") {
    return (
      recipe.supportedScopes.includes("client") ||
      recipe.supportedScopes.includes("server") ||
      recipe.supportedScopes.includes("hybrid")
    );
  }

  return recipe.supportedScopes.includes(scope);
}

export function withDefaultRecipes(scope: Scope, recipeIds: string[]): string[] {
  const defaults = Object.values(recipes)
    .filter((recipe) => isDefaultRecipeSupportedForScope(recipe, scope))
    .map((recipe) => recipe.id);

  const merged = [...defaults];

  for (const id of recipeIds) {
    if (!merged.includes(id)) {
      merged.push(id);
    }
  }

  return merged;
}
