export type Scope = "client" | "server" | "hybrid" | "infrastructure";

export interface TemplateConfig {
  id: string;
  name: string;
  scope: Scope;
  description: string;
  path: string;
}

export type RecipeCategory =
  | "linter"
  | "state"
  | "ui"
  | "form"
  | "fetcher"
  | "orm"
  | "infrastructure"
  | "utils";

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
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
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
