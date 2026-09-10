import { cancel, confirm, intro, isCancel, outro, select, text } from "@clack/prompts";
import pc from "picocolors";
import {
  getAllTemplateIds,
  getRecipesByCategory,
  getTemplate,
  withDefaultRecipes,
} from "./registry/index.js";
import type { RecipeConfig, ScaffoldConfig, Scope } from "./types.js";
import { isValidNpmPackageName } from "./validator.js";

type LinterChoice = "biome" | "eslint" | "none";

const STATE_RECIPE_HINTS: Partial<Record<string, string>> = {
  zustand: "Recommended",
};

function getStateRecipeLabel(recipe: RecipeConfig): string {
  if (recipe.id === "zustand") {
    return "Zustand v5";
  }

  return recipe.name;
}

function mapLinterToRecipe(linter: LinterChoice): string | null {
  if (linter === "biome" || linter === "eslint") {
    return linter;
  }

  return null;
}

async function promptClientRecipes(): Promise<string[] | null> {
  const recipeIds: string[] = [];
  const stateRecipes = getRecipesByCategory("state");
  const formRecipes = getRecipesByCategory("form");
  const fetcherRecipes = getRecipesByCategory("fetcher");
  const uiRecipes = getRecipesByCategory("ui");

  const stateChoice = await select<string>({
    message: "Select state management:",
    options: [
      ...stateRecipes.map((recipe) => ({
        value: recipe.id,
        label: getStateRecipeLabel(recipe),
        hint: STATE_RECIPE_HINTS[recipe.id],
      })),
      { value: "none", label: "No state management" },
    ],
    initialValue: "none",
  });

  if (isCancel(stateChoice)) {
    cancel("Cancelled.");
    return null;
  }

  const formChoice = await select<string>({
    message: "Select form + validation:",
    options: [
      ...formRecipes.map((recipe) => ({
        value: recipe.id,
        label: recipe.name,
        hint: recipe.id === "hookform-zod" ? "Recommended" : undefined,
      })),
      { value: "none", label: "No form library" },
    ],
    initialValue: "none",
  });

  if (isCancel(formChoice)) {
    cancel("Cancelled.");
    return null;
  }

  const fetcherChoice = await select<string>({
    message: "Select HTTP fetcher:",
    options: [
      ...fetcherRecipes.map((recipe) => ({
        value: recipe.id,
        label: recipe.name,
        hint: recipe.id === "kyjs" ? "Lightweight fetch wrapper" : undefined,
      })),
      { value: "none", label: "No HTTP client" },
    ],
    initialValue: "none",
  });

  if (isCancel(fetcherChoice)) {
    cancel("Cancelled.");
    return null;
  }

  const uiChoice = await select<string>({
    message: "Select UI kit:",
    options: [
      ...uiRecipes.map((recipe) => ({
        value: recipe.id,
        label: recipe.name,
      })),
      { value: "none", label: "No UI kit" },
    ],
    initialValue: "none",
  });

  if (isCancel(uiChoice)) {
    cancel("Cancelled.");
    return null;
  }

  const linterChoice = await select<LinterChoice>({
    message: "Select linter / formatter:",
    options: [
      {
        value: "biome",
        label: "Biome — Fast, all-in-one",
        hint: "Recommended",
      },
      { value: "eslint", label: "ESLint — Flat Config" },
      { value: "none", label: "No linter" },
    ],
    initialValue: "biome",
  });

  if (isCancel(linterChoice)) {
    cancel("Cancelled.");
    return null;
  }

  if (stateChoice !== "none") {
    recipeIds.push(stateChoice);
  }

  if (formChoice !== "none") {
    recipeIds.push(formChoice);
  }

  if (fetcherChoice !== "none") {
    recipeIds.push(fetcherChoice);
  }

  if (uiChoice !== "none") {
    recipeIds.push(uiChoice);
  }

  const linterRecipe = mapLinterToRecipe(linterChoice);
  if (linterRecipe) {
    recipeIds.push(linterRecipe);
  }

  return recipeIds;
}

async function promptRecipesForScope(scope: Scope): Promise<string[] | null> {
  if (scope === "client" || scope === "hybrid") {
    return promptClientRecipes();
  }

  return [];
}

export async function runInteractivePrompts(
  initialProjectName?: string,
): Promise<ScaffoldConfig | null> {
  intro(`${pc.bgCyan(pc.black(" zealakit "))} Recipe-based scaffolding`);

  let projectName = initialProjectName;

  if (!projectName) {
    const nameInput = await text({
      message: "What is your project name?",
      placeholder: "my-app",
      validate: (value) => {
        const name = value?.trim() ?? "";
        if (!name) {
          return "Project name cannot be empty.";
        }

        if (!isValidNpmPackageName(name)) {
          return "Invalid name. Use lowercase letters, no spaces (npm naming rules).";
        }
      },
    });

    if (isCancel(nameInput)) {
      cancel("Cancelled.");
      return null;
    }

    projectName = nameInput;
  }

  const templateId = await select({
    message: "Select a base template:",
    options: getAllTemplateIds().map((id) => ({
      value: id,
      label: id === "vite-react" ? "Vite + React + TypeScript" : id,
      hint: id === "vite-react" ? "Recommended" : undefined,
    })),
    initialValue: "vite-react",
  });

  if (isCancel(templateId)) {
    cancel("Cancelled.");
    return null;
  }

  const template = getTemplate(templateId);
  if (!template) {
    cancel("Cancelled.");
    return null;
  }

  const recipeIds = await promptRecipesForScope(template.scope);
  if (recipeIds === null) {
    return null;
  }

  const resolvedRecipeIds = withDefaultRecipes(template.scope, recipeIds);

  const summary = [
    `  ${pc.dim("Name:")}      ${projectName}`,
    `  ${pc.dim("Template:")} ${templateId}`,
    `  ${pc.dim("Scope:")}    ${template.scope}`,
    `  ${pc.dim("Recipes:")}  ${resolvedRecipeIds.length > 0 ? resolvedRecipeIds.join(", ") : pc.dim("(none)")}`,
  ].join("\n");

  console.log(`\n${pc.bold("Summary:")}\n${summary}\n`);

  const shouldProceed = await confirm({
    message: "Start scaffolding?",
    initialValue: true,
  });

  if (isCancel(shouldProceed) || !shouldProceed) {
    cancel("Cancelled.");
    return null;
  }

  outro(pc.green("Creating project..."));

  return {
    projectName,
    templateId,
    recipeIds: resolvedRecipeIds,
  };
}
