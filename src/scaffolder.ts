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

const RECIPE_OVERLAYS_DIR = "overlays";
const RECIPE_SCAFFOLD_DIR = "scaffold";
const RECIPE_META_DIRS = new Set([RECIPE_OVERLAYS_DIR, RECIPE_SCAFFOLD_DIR]);

function getRecipeFilesPath(recipeId: string): string {
  return path.join(RECIPES_DIR, recipeId);
}

function listRecipeOverlayIds(overlaysDir: string): string[] {
  return fs
    .readdirSync(overlaysDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function isInsideRecipeMetaDir(recipePath: string, srcPath: string): boolean {
  const relativePath = path.relative(recipePath, srcPath);
  if (relativePath === "" || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return false;
  }

  return RECIPE_META_DIRS.has(relativePath.split(path.sep)[0] ?? "");
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

function copyDirectoryContents(
  source: string,
  destination: string,
  filter?: (src: string) => boolean,
): void {
  if (!fs.existsSync(source)) {
    throw new Error(`Source directory does not exist: ${source}`);
  }

  fse.ensureDirSync(destination);
  fse.copySync(source, destination, { overwrite: true, errorOnExist: false, filter });
}

function copyRecipeFiles(recipeId: string, templateId: string, targetDir: string): void {
  const recipePath = getRecipeFilesPath(recipeId);

  if (!fs.existsSync(recipePath)) {
    throw new Error(`Recipe files do not exist: ${recipeId}`);
  }

  copyDirectoryContents(recipePath, targetDir, (src) => !isInsideRecipeMetaDir(recipePath, src));

  const overlaysDir = path.join(recipePath, RECIPE_OVERLAYS_DIR);
  if (!fs.existsSync(overlaysDir)) {
    return;
  }

  const overlayPath = path.join(overlaysDir, templateId);
  if (!fs.existsSync(overlayPath)) {
    const available = listRecipeOverlayIds(overlaysDir);
    throw new Error(
      `Recipe '${recipeId}' has no overlay for template '${templateId}'. Available: ${available.join(", ") || "(none)"}.`,
    );
  }

  copyDirectoryContents(overlayPath, targetDir);
}

function insertAgentEntry(filePath: string, entry: string): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let raw = fs.readFileSync(filePath, "utf-8");
  const lines = entry
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  const missing = lines.filter((line) => !raw.includes(line));

  if (missing.length === 0) {
    return;
  }

  const block = `${missing.join("\n")}\n`;

  if (/^- \*\*Structure:\*\*[^\n]*\n/m.test(raw)) {
    raw = raw.replace(/(^- \*\*Structure:\*\*[^\n]*\n)/m, `$1${block}`);
  } else if (raw.includes("## Always follow")) {
    raw = raw.replace(/(## Always follow\n\n)/, `$1${block}`);
  } else {
    raw = `${raw.trimEnd()}\n\n${block}`;
  }

  fs.writeFileSync(filePath, raw, "utf-8");
}

function applyRecipeAgentEntry(recipeId: string, targetDir: string): void {
  const entryPath = path.join(getRecipeFilesPath(recipeId), RECIPE_SCAFFOLD_DIR, "agent-entry.md");
  if (!fs.existsSync(entryPath)) {
    return;
  }

  const entry = fs.readFileSync(entryPath, "utf-8").trim();
  if (!entry) {
    return;
  }

  insertAgentEntry(path.join(targetDir, "AGENTS.md"), entry);
  insertAgentEntry(path.join(targetDir, "CLAUDE.md"), entry);
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
    copyRecipeFiles(recipeId, config.templateId, targetDir);
    applyRecipeAgentEntry(recipeId, targetDir);
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
