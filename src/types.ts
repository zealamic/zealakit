import type { RECIPE_CATEGORIES, SCOPES } from "./constants.js";

export type Scope = (typeof SCOPES)[number];

export interface TemplateConfig {
  id: string;
  name: string;
  scope: Scope;
  description: string;
  path: string;
  /**
   * Recipe overlay folder under `recipes/<id>/overlays/`.
   * Defaults to `id`. Use a stable family id (e.g. `next`) when multiple
   * template versions should share the same recipe overlays.
   */
  overlay?: string;
}

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number];

export type RecipeFileTransform = {
  file: string;
  /** Regex replacement (mutually exclusive with `append`) */
  pattern?: RegExp;
  replacement?: string;
  /** Append this text if missing — does not overwrite existing content */
  append?: string;
};

export interface RecipeConfig {
  id: string;
  name: string;
  category: RecipeCategory;
  /** Scopes this recipe supports */
  supportedScopes: Scope[] | "all";
  /** Only one recipe from this category may be selected */
  exclusive?: boolean;
  /** Always applied for matching template scopes (not shown in prompts) */
  default?: boolean;
  packages: Record<string, string>;
  /** Extra packages merged for a specific overlay family (e.g. `next`, `vite-react`) */
  overlayPackages?: Record<string, Record<string, string>>;
  /** Extra devDependencies merged for a specific overlay family */
  overlayDevDependencies?: Record<string, Record<string, string>>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  /** Regex replacements applied per overlay (or template id) after the recipe overlay is copied */
  fileTransforms?: Record<string, RecipeFileTransform[]>;
}

export interface ScaffoldConfig {
  projectName: string;
  templateId: string;
  recipeIds: string[];
}

export interface CliOptions {
  projectName?: string;
  template?: string;
  with?: string;
  yes?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
