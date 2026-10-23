import { Command } from "commander";
import pc from "picocolors";
import { runInteractivePrompts } from "./prompts.js";
import {
  getAllRecipeIds,
  getAllTemplateIds,
  getTemplate,
  withDefaultRecipes,
} from "./registry/index.js";
import { printSuccess, scaffoldProject } from "./scaffolder.js";
import type { CliOptions, ScaffoldConfig } from "./types.js";
import { printValidationErrors, validateScaffoldInput } from "./validator.js";

const program = new Command();

program
  .name("zealakit")
  .description("Recipe-based scaffolding CLI for TypeScript project templates")
  .version("1.0.0")
  .argument("[project-name]", "Project name (npm naming rules)")
  .option("-t, --template <template>", "Base template (e.g. vite-react)", "vite-react")
  .option(
    "-w, --with <recipes>",
    `Recipes to apply, comma-separated (e.g. biome). Available: ${getAllRecipeIds().join(", ")}`,
  )
  .option("-y, --yes", "Non-interactive mode (skip overwrite confirmation)")
  .action(async (projectName: string | undefined, options: CliOptions) => {
    try {
      const config = await resolveScaffoldConfig(projectName, options);

      if (!config) {
        process.exit(0);
      }

      const template = getTemplate(config.templateId);
      if (template) {
        config.recipeIds = withDefaultRecipes(template.scope, config.recipeIds);
      }

      const validation = await validateScaffoldInput(
        config.projectName,
        config.templateId,
        config.recipeIds,
        process.cwd(),
        { yes: options.yes },
      );

      if (!validation.valid) {
        printValidationErrors(validation.errors);
        process.exit(1);
      }

      const targetDir = await scaffoldProject(config);
      printSuccess(targetDir, config.projectName, config.templateId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(pc.red(`✖ Error: ${message}`));
      process.exit(1);
    }
  });

async function resolveScaffoldConfig(
  projectName: string | undefined,
  options: CliOptions,
): Promise<ScaffoldConfig | null> {
  const hasRecipesFlag = Boolean(options.with?.trim());
  const isFullySpecified = Boolean(projectName) && Boolean(options.template) && hasRecipesFlag;

  if (options.yes && !projectName) {
    console.error(pc.red("✖ Flag -y requires a project name."));
    process.exit(1);
  }

  if (options.yes && projectName) {
    const templateId = options.template ?? "vite-react";

    if (!getAllTemplateIds().includes(templateId)) {
      console.error(
        pc.red(
          `✖ Template "${templateId}" is invalid. Available: ${getAllTemplateIds().join(", ")}`,
        ),
      );
      process.exit(1);
    }

    if (!hasRecipesFlag) {
      return {
        projectName,
        templateId,
        recipeIds: [],
      };
    }
  }

  if (!hasRecipesFlag) {
    return runInteractivePrompts(projectName);
  }

  if (!projectName) {
    if (options.yes) {
      console.error(pc.red("✖ Flag -y requires a project name."));
      process.exit(1);
    }

    return runInteractivePrompts();
  }

  const templateId = options.template ?? "vite-react";
  const recipeIds = parseRecipeList(options.with ?? "");

  if (!getAllTemplateIds().includes(templateId)) {
    console.error(
      pc.red(`✖ Template "${templateId}" is invalid. Available: ${getAllTemplateIds().join(", ")}`),
    );
    process.exit(1);
  }

  if (isFullySpecified) {
    return {
      projectName,
      templateId,
      recipeIds,
    };
  }

  return {
    projectName,
    templateId,
    recipeIds,
  };
}

function parseRecipeList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

program.parse(process.argv);
