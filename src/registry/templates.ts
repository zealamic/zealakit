import type { TemplateConfig } from "../types.js";

export const templates: Record<string, TemplateConfig> = {
  "vite-react": {
    id: "vite-react",
    name: "Vite + React",
    scope: "client",
    description: "Minimal Vite + React + TypeScript starter",
    path: "vite-react",
  },
  "next-v16": {
    id: "next-v16",
    name: "Next.js 16",
    scope: "hybrid",
    description: "Next.js App Router + TypeScript starter",
    path: "next-v16",
    // Shared with future next-v17 / next-v18 templates
    overlay: "next",
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

/** Overlay folder name for recipe overlays under recipes/<recipe>/overlays. */
export function getTemplateOverlayId(templateId: string): string {
  const template = getTemplate(templateId);
  return template?.overlay ?? templateId;
}
