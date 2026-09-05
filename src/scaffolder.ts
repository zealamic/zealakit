import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fse from "fs-extra";
import pc from "picocolors";
import { getRecipe, getTemplate } from "./registry/index.js";
import type { ScaffoldConfig } from "./types.js";

interface PackageJson {
  name: string;
  private?: boolean;
  version?: string;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, "..");
const TEMPLATES_DIR = path.join(PACKAGE_ROOT, "templates");
const RECIPES_DIR = path.join(PACKAGE_ROOT, "recipes");

function getBaseTemplatePath(templateId: string): string {
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Base template does not exist: ${templateId}`);
  }

  return path.join(TEMPLATES_DIR, template.path);
}

function getRecipeFilesPath(recipeId: string): string {
  return path.join(RECIPES_DIR, recipeId);
}

function mergeDependencyRecords(
  base: Record<string, string> | undefined,
  additions: Record<string, string> | undefined,
): Record<string, string> {
  return {
    ...(base ?? {}),
    ...(additions ?? {}),
  };
}

function mergeScripts(
  base: Record<string, string> | undefined,
  additions: Record<string, string> | undefined,
): Record<string, string> {
  return {
    ...(base ?? {}),
    ...(additions ?? {}),
  };
}

function copyDirectoryContents(source: string, destination: string): void {
  if (!fs.existsSync(source)) {
    throw new Error(`Source directory does not exist: ${source}`);
  }

  fse.ensureDirSync(destination);
  fse.copySync(source, destination, { overwrite: true, errorOnExist: false });
}

function mergePackageJson(targetDir: string, config: ScaffoldConfig): void {
  const packageJsonPath = path.join(targetDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`package.json not found in template at ${targetDir}`);
  }

  const raw = fs.readFileSync(packageJsonPath, "utf-8");
  const packageJson = JSON.parse(raw) as PackageJson;

  packageJson.name = config.projectName;

  for (const recipeId of config.recipeIds) {
    const recipe = getRecipe(recipeId);
    if (!recipe) {
      continue;
    }

    packageJson.dependencies = mergeDependencyRecords(packageJson.dependencies, recipe.packages);
    packageJson.devDependencies = mergeDependencyRecords(
      packageJson.devDependencies,
      recipe.devDependencies,
    );
    packageJson.scripts = mergeScripts(packageJson.scripts, recipe.scripts);
  }

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf-8");
}

export async function scaffoldProject(
  config: ScaffoldConfig,
  cwd: string = process.cwd(),
): Promise<string> {
  const targetDir = path.resolve(cwd, config.projectName);
  const baseTemplatePath = getBaseTemplatePath(config.templateId);

  if (!fs.existsSync(baseTemplatePath)) {
    throw new Error(`Base template does not exist: ${config.templateId}`);
  }

  if (fs.existsSync(targetDir)) {
    fse.emptyDirSync(targetDir);
  }

  fse.ensureDirSync(targetDir);

  copyDirectoryContents(baseTemplatePath, targetDir);

  for (const recipeId of config.recipeIds) {
    const recipePath = getRecipeFilesPath(recipeId);

    if (!fs.existsSync(recipePath)) {
      throw new Error(`Recipe files do not exist: ${recipeId}`);
    }

    copyDirectoryContents(recipePath, targetDir);
  }

  if (config.recipeIds.includes("biome")) {
    normalizeScaffoldedBiomeConfig(targetDir);
  }

  mergePackageJson(targetDir, config);

  return targetDir;
}

function normalizeScaffoldedBiomeConfig(targetDir: string): void {
  const biomeConfigPath = path.join(targetDir, "biome.json");
  if (!fs.existsSync(biomeConfigPath)) {
    return;
  }

  const raw = fs.readFileSync(biomeConfigPath, "utf-8");
  const biomeConfig = JSON.parse(raw) as Record<string, unknown>;

  // Recipe file uses root:false so it can live nested inside the zealakit repo.
  // Scaffolded projects should treat biome.json as their root config.
  delete biomeConfig.root;

  fs.writeFileSync(biomeConfigPath, `${JSON.stringify(biomeConfig, null, 2)}\n`, "utf-8");
}

export function printSuccess(targetDir: string, projectName: string): void {
  const relativePath = path.relative(process.cwd(), targetDir) || projectName;

  console.log();
  console.log(`${pc.green("✔")} Project ${pc.cyan(projectName)} created successfully!`);
  console.log();
  console.log(pc.bold("Next steps:"));
  console.log(`  ${pc.cyan("cd")} ${relativePath}`);
  console.log(`  ${pc.cyan("npm install")}`);
  console.log(`  ${pc.cyan("npm run dev")}`);
  console.log();
}
