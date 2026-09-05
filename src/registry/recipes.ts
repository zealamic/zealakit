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
  "client-utils": {
    id: "client-utils",
    name: "Client utils",
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
};

export const PROMPT_ONLY_RECIPES = ["shadcn"] as const;

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
