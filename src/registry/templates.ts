import type { TemplateConfig } from "../types.js";

export const templates: Record<string, TemplateConfig> = {
  "vite-react": {
    id: "vite-react",
    name: "Vite + React",
    scope: "client",
    description: "Minimal Vite + React + TypeScript starter",
    path: "vite-react",
  },
};

export function getTemplate(id: string): TemplateConfig | undefined {
  return templates[id];
}

export function getAllTemplateIds(): string[] {
  return Object.keys(templates);
}

export function getTemplateScope(templateId: string): TemplateConfig["scope"] | undefined {
  return templates[templateId]?.scope;
}
