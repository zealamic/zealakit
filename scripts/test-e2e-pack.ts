import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const E2E_WORK_DIR = path.join(os.tmpdir(), "zealakit-e2e-tests");

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  output: string;
}

interface TestCaseResult {
  name: string;
  passed: boolean;
  errors: string[];
}

function log(message: string): void {
  console.log(message);
}

function green(text: string): string {
  return `\x1b[32m${text}\x1b[0m`;
}

function red(text: string): string {
  return `\x1b[31m${text}\x1b[0m`;
}

function dim(text: string): string {
  return `\x1b[2m${text}\x1b[0m`;
}

function runCommand(command: string, args: string[], cwd: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr,
        output: `${stdout}\n${stderr}`,
      });
    });
  });
}

async function runNpxTarball(
  tarballPath: string,
  projectArgs: string[],
  cwd: string,
): Promise<CommandResult> {
  return runCommand("npx", ["--yes", `--package=${tarballPath}`, "zealakit", ...projectArgs], cwd);
}

function assert(condition: boolean, message: string, errors: string[]): void {
  if (!condition) {
    errors.push(message);
  }
}

function readPackageJson(projectDir: string): Record<string, unknown> {
  const raw = fs.readFileSync(path.join(projectDir, "package.json"), "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

function pathExists(targetPath: string): boolean {
  return fs.existsSync(targetPath);
}

async function buildCli(): Promise<void> {
  log(dim("→ Building CLI (npm run build)..."));
  const result = await runCommand("npm", ["run", "build"], PROJECT_ROOT);
  if (result.exitCode !== 0) {
    throw new Error(`Build failed:\n${result.output}`);
  }
}

async function packCli(): Promise<string> {
  log(dim("→ Packing CLI (npm pack)..."));
  const result = await runCommand("npm", ["pack", "--silent"], PROJECT_ROOT);
  if (result.exitCode !== 0) {
    throw new Error(`npm pack failed:\n${result.output}`);
  }

  const tarballName = result.stdout.trim().split("\n").pop()?.trim();
  if (!tarballName) {
    throw new Error("Could not determine tarball name from npm pack output.");
  }

  const tarballPath = path.join(PROJECT_ROOT, tarballName);
  if (!fs.existsSync(tarballPath)) {
    throw new Error(`Tarball not found at ${tarballPath}`);
  }

  return tarballPath;
}

function verifyTarballContents(tarballPath: string): void {
  log(dim("→ Verifying tarball contents..."));
  const listing = execSync(`tar -tzf "${tarballPath}"`, { encoding: "utf-8" });
  const requiredPrefixes = ["package/dist/", "package/templates/vite-react/", "package/recipes/"];

  for (const prefix of requiredPrefixes) {
    if (!listing.includes(prefix)) {
      throw new Error(`Tarball is missing required path prefix: ${prefix}`);
    }
  }
}

async function testCase1ClientPass(tarballPath: string): Promise<TestCaseResult> {
  const name = "Test 1: client pass (biome + zustand + hookform-zod + kyjs)";
  const errors: string[] = [];
  const appName = "test-client";
  const appDir = path.join(E2E_WORK_DIR, appName);

  const result = await runNpxTarball(
    tarballPath,
    [appName, "-t", "vite-react", "-w", "biome,zustand,hookform-zod,kyjs", "-y"],
    E2E_WORK_DIR,
  );

  assert(result.exitCode === 0, `Expected exit code 0, got ${result.exitCode}`, errors);
  assert(pathExists(appDir), `Directory ${appName}/ was not created`, errors);
  assert(
    pathExists(path.join(appDir, "src/lib/utils/api.ts")),
    "default client-utils recipe should copy api.ts",
    errors,
  );
  assert(
    pathExists(path.join(appDir, "src/lib/utils/index.ts")),
    "default client-utils recipe should copy index.ts",
    errors,
  );
  assert(
    pathExists(path.join(appDir, "src/lib/schemas/example.schema.ts")),
    "example.schema.ts should exist",
    errors,
  );
  assert(
    pathExists(path.join(appDir, "src/lib/fetcher/index.ts")),
    "kyjs recipe should copy src/lib/fetcher/index.ts",
    errors,
  );
  assert(pathExists(path.join(appDir, "biome.json")), "biome.json should exist", errors);
  assert(
    pathExists(path.join(appDir, "src/stores/something.store.ts")),
    "something.store.ts should exist",
    errors,
  );
  assert(
    !pathExists(path.join(appDir, "src/stores/something.store.test.ts")),
    "something.store.test.ts should NOT exist",
    errors,
  );
  assert(
    !pathExists(path.join(appDir, "vitest.config.ts")),
    "vitest.config.ts should NOT exist",
    errors,
  );
  assert(
    !pathExists(path.join(appDir, "eslint.config.js")),
    "eslint.config.js should NOT exist",
    errors,
  );

  if (pathExists(path.join(appDir, "package.json"))) {
    const pkg = readPackageJson(appDir);
    const deps = (pkg.dependencies ?? {}) as Record<string, string>;
    const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
    const scripts = (pkg.scripts ?? {}) as Record<string, string>;

    assert("zustand" in deps, "package.json should include zustand", errors);
    assert("react-hook-form" in deps, "package.json should include react-hook-form", errors);
    assert("zod" in deps, "package.json should include zod", errors);
    assert(
      "@hookform/resolvers" in deps,
      "package.json should include @hookform/resolvers",
      errors,
    );
    assert("ky" in deps, "package.json should include ky", errors);
    assert(deps.ky === "^2.1.0", `ky version should be ^2.1.0, got ${deps.ky}`, errors);
    assert(!("axios" in deps), "package.json should NOT include axios", errors);
    assert("@biomejs/biome" in devDeps, "package.json should include @biomejs/biome", errors);
    assert(!("antd" in deps), "package.json should NOT include antd", errors);
    assert(!("vitest" in devDeps), "package.json should NOT include vitest", errors);
    assert("check" in scripts, 'package.json scripts should include "check"', errors);
    assert(!("test" in scripts), 'package.json scripts should NOT include "test"', errors);
    assert(!("lint" in scripts), 'package.json scripts should NOT include "lint"', errors);
  }

  return { name, passed: errors.length === 0, errors };
}

async function testCase2LinterConflict(tarballPath: string): Promise<TestCaseResult> {
  const name = "Test 2: linter conflict (biome + eslint)";
  const errors: string[] = [];
  const appName = "test-conflict";
  const appDir = path.join(E2E_WORK_DIR, appName);

  const result = await runNpxTarball(
    tarballPath,
    [appName, "-t", "vite-react", "-w", "biome,eslint", "-y"],
    E2E_WORK_DIR,
  );

  assert(result.exitCode !== 0, `Expected non-zero exit code, got ${result.exitCode}`, errors);
  assert(
    !pathExists(appDir) || fs.readdirSync(appDir).length === 0,
    `${appName}/ should not exist or should be empty`,
    errors,
  );
  assert(/conflict/i.test(result.output), "Output should mention conflict", errors);
  assert(/linter/i.test(result.output), "Output should mention linter group", errors);

  return { name, passed: errors.length === 0, errors };
}

async function testCase3EslintStandalone(tarballPath: string): Promise<TestCaseResult> {
  const name = "Test 3: eslint standalone pass";
  const errors: string[] = [];
  const appName = "test-eslint";
  const appDir = path.join(E2E_WORK_DIR, appName);

  const result = await runNpxTarball(
    tarballPath,
    [appName, "-t", "vite-react", "-w", "eslint", "-y"],
    E2E_WORK_DIR,
  );

  assert(result.exitCode === 0, `Expected exit code 0, got ${result.exitCode}`, errors);
  assert(
    pathExists(path.join(appDir, "eslint.config.js")),
    "eslint.config.js should exist",
    errors,
  );
  assert(!pathExists(path.join(appDir, "biome.json")), "biome.json should NOT exist", errors);
  assert(
    pathExists(path.join(appDir, "src/lib/utils/api.ts")),
    "default client-utils recipe should copy api.ts",
    errors,
  );
  assert(
    !pathExists(path.join(appDir, "src/lib/fetcher/index.ts")),
    "fetcher should NOT exist when no fetcher recipe is selected",
    errors,
  );

  if (pathExists(path.join(appDir, "package.json"))) {
    const pkg = readPackageJson(appDir);
    const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
    assert("eslint" in devDeps, "package.json should include eslint in devDependencies", errors);
  }

  return { name, passed: errors.length === 0, errors };
}

async function testCase4StateConflict(tarballPath: string): Promise<TestCaseResult> {
  const name = "Test 4: state conflict (zustand + nanostores)";
  const errors: string[] = [];
  const appName = "test-state-conflict";
  const appDir = path.join(E2E_WORK_DIR, appName);

  const result = await runNpxTarball(
    tarballPath,
    [appName, "-t", "vite-react", "-w", "zustand,nanostores", "-y"],
    E2E_WORK_DIR,
  );

  assert(result.exitCode !== 0, `Expected non-zero exit code, got ${result.exitCode}`, errors);
  assert(
    !pathExists(appDir) || fs.readdirSync(appDir).length === 0,
    `${appName}/ should not exist or should be empty`,
    errors,
  );
  assert(/conflict/i.test(result.output), "Output should mention conflict", errors);
  assert(/state/i.test(result.output), "Output should mention state group", errors);

  return { name, passed: errors.length === 0, errors };
}

async function testCase5AxiosPass(tarballPath: string): Promise<TestCaseResult> {
  const name = "Test 5: axios fetcher pass";
  const errors: string[] = [];
  const appName = "test-axios";
  const appDir = path.join(E2E_WORK_DIR, appName);

  const result = await runNpxTarball(
    tarballPath,
    [appName, "-t", "vite-react", "-w", "axios", "-y"],
    E2E_WORK_DIR,
  );

  assert(result.exitCode === 0, `Expected exit code 0, got ${result.exitCode}`, errors);
  assert(
    pathExists(path.join(appDir, "src/lib/fetcher/index.ts")),
    "axios recipe should copy src/lib/fetcher/index.ts",
    errors,
  );

  if (pathExists(path.join(appDir, "package.json"))) {
    const pkg = readPackageJson(appDir);
    const deps = (pkg.dependencies ?? {}) as Record<string, string>;
    assert("axios" in deps, "package.json should include axios", errors);
    assert(deps.axios === "^1.20.0", `axios version should be ^1.20.0, got ${deps.axios}`, errors);
    assert(!("ky" in deps), "package.json should NOT include ky", errors);
  }

  return { name, passed: errors.length === 0, errors };
}

async function testCase6FetcherConflict(tarballPath: string): Promise<TestCaseResult> {
  const name = "Test 6: fetcher conflict (kyjs + axios)";
  const errors: string[] = [];
  const appName = "test-fetcher-conflict";
  const appDir = path.join(E2E_WORK_DIR, appName);

  const result = await runNpxTarball(
    tarballPath,
    [appName, "-t", "vite-react", "-w", "kyjs,axios", "-y"],
    E2E_WORK_DIR,
  );

  assert(result.exitCode !== 0, `Expected non-zero exit code, got ${result.exitCode}`, errors);
  assert(
    !pathExists(appDir) || fs.readdirSync(appDir).length === 0,
    `${appName}/ should not exist or should be empty`,
    errors,
  );
  assert(/conflict/i.test(result.output), "Output should mention conflict", errors);
  assert(/fetcher/i.test(result.output), "Output should mention fetcher group", errors);

  return { name, passed: errors.length === 0, errors };
}

function printReport(results: TestCaseResult[]): void {
  log(`\n${"=".repeat(60)}`);
  log("E2E Pack Test Report");
  log("=".repeat(60));

  for (const result of results) {
    const icon = result.passed ? green("✔") : red("✖");
    log(`${icon} ${result.name}`);
    if (!result.passed) {
      for (const error of result.errors) {
        log(`  ${red("→")} ${error}`);
      }
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  log("=".repeat(60));
  log(
    passed === total
      ? green(`All ${total} tests passed.`)
      : red(`${passed}/${total} tests passed.`),
  );
  log(`${"=".repeat(60)}\n`);
}

function removeTarball(tarballPath: string | null): void {
  if (tarballPath && fs.existsSync(tarballPath)) {
    fs.rmSync(tarballPath, { force: true });
  }
}

function removeWorkDir(): void {
  if (fs.existsSync(E2E_WORK_DIR)) {
    fs.rmSync(E2E_WORK_DIR, { recursive: true, force: true });
  }
}

function removePackedTarballsInRoot(): void {
  const entries = fs.readdirSync(PROJECT_ROOT);
  for (const entry of entries) {
    if (entry.startsWith("zealakit-") && entry.endsWith(".tgz")) {
      fs.rmSync(path.join(PROJECT_ROOT, entry), { force: true });
    }
  }
}

async function main(): Promise<void> {
  let tarballPath: string | null = null;
  const results: TestCaseResult[] = [];

  try {
    log(dim("\nZealakit E2E Pack Tests\n"));

    removeWorkDir();
    fs.mkdirSync(E2E_WORK_DIR, { recursive: true });

    await buildCli();
    tarballPath = await packCli();
    verifyTarballContents(tarballPath);

    log(dim(`→ Tarball: ${path.basename(tarballPath)}\n`));
    log(dim("→ Running test cases...\n"));

    results.push(await testCase1ClientPass(tarballPath));
    results.push(await testCase2LinterConflict(tarballPath));
    results.push(await testCase3EslintStandalone(tarballPath));
    results.push(await testCase4StateConflict(tarballPath));
    results.push(await testCase5AxiosPass(tarballPath));
    results.push(await testCase6FetcherConflict(tarballPath));

    printReport(results);

    const allPassed = results.every((r) => r.passed);
    process.exit(allPassed ? 0 : 1);
  } finally {
    removeTarball(tarballPath);
    removePackedTarballsInRoot();
    removeWorkDir();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(red(`\nFatal error: ${message}\n`));
  removeWorkDir();
  removePackedTarballsInRoot();
  process.exit(1);
});
