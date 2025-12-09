import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createMarkdownTable } from "./markdownTable";

const OUTPUT_DIRECTORY = "lists";

const URLS = {
  github: "https://github.com",
  themes:
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/refs/heads/master/community-css-themes.json",
  plugins:
    "https://raw.githubusercontent.com/obsidianmd/obsidian-releases/refs/heads/master/community-plugins.json",
};

export type PluginRecord = {
  name: string;
  repo: string;
  description: string;
};

export type ThemeRecord = {
  name: string;
  repo: string;
  screenshot: string;
};

export type Normalizer<T> = (payload: unknown) => T[];
export type TableRenderer<T> = (records: T[]) => string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildGithubUrl(repo: string): string {
  return encodeURI(`${URLS.github}/${repo}`);
}

function buildScreenshotUrl(theme: ThemeRecord): string {
  return encodeURI(
    `https://raw.githubusercontent.com/${theme.repo}/master/${theme.screenshot}`,
  );
}

function formatLink(label: string, href: string): string {
  return `[${label}](${href})`;
}

function formatImage(alt: string, href: string): string {
  return `![${alt}](${href})`;
}

export function normalizePlugins(payload: unknown): PluginRecord[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.reduce<PluginRecord[]>((acc, item) => {
    if (!isRecord(item)) {
      return acc;
    }

    const name = typeof item.name === "string" ? item.name : null;
    const repo = typeof item.repo === "string" ? item.repo : null;
    const description =
      typeof item.description === "string" ? item.description : "";

    if (name && repo) {
      acc.push({ name, repo, description });
    }

    return acc;
  }, []);
}

export function normalizeThemes(payload: unknown): ThemeRecord[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.reduce<ThemeRecord[]>((acc, item) => {
    if (!isRecord(item)) {
      return acc;
    }

    const name = typeof item.name === "string" ? item.name : null;
    const repo = typeof item.repo === "string" ? item.repo : null;
    const screenshot =
      typeof item.screenshot === "string" ? item.screenshot : null;

    if (name && repo && screenshot) {
      acc.push({ name, repo, screenshot });
    }

    return acc;
  }, []);
}

export function renderPluginTable(records: PluginRecord[]): string {
  const headers = ["📁 Name", "✨ Description"];
  const rows = records.map((plugin) => [
    formatLink(plugin.name, buildGithubUrl(plugin.repo)),
    plugin.description || "—",
  ]);

  return createMarkdownTable(headers, rows);
}

export function renderThemeTable(records: ThemeRecord[]): string {
  const headers = ["📁 Repository", "📷 Screenshot"];
  const rows = records.map((theme) => [
    formatLink(theme.repo, buildGithubUrl(theme.repo)),
    formatImage(theme.name, buildScreenshotUrl(theme)),
  ]);

  return createMarkdownTable(headers, rows);
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

async function writeMarkdownFile(
  filename: string,
  content: string,
): Promise<void> {
  const filePath = join(OUTPUT_DIRECTORY, `${filename}.md`);
  await writeFile(filePath, `${content}\n`, "utf8");
}

async function generateList<T>(options: {
  filename: string;
  url: string;
  normalize: Normalizer<T>;
  render: TableRenderer<T>;
}): Promise<void> {
  const raw = await fetchJson(options.url);
  const normalized = options.normalize(raw);
  const table = options.render(normalized);
  await writeMarkdownFile(options.filename, table);
}

async function ensureOutputDirectory(): Promise<void> {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
}

export async function runGeneration(): Promise<void> {
  await ensureOutputDirectory();

  const generationResults = await Promise.allSettled([
    generateList({
      filename: "themes",
      url: URLS.themes,
      normalize: normalizeThemes,
      render: renderThemeTable,
    }),
    generateList({
      filename: "plugins",
      url: URLS.plugins,
      normalize: normalizePlugins,
      render: renderPluginTable,
    }),
  ]);

  const failures = generationResults.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );

  if (failures.length > 0) {
    const reasons = failures.map((failure) => {
      if (failure.reason instanceof Error) {
        return failure.reason;
      }

      if (typeof failure.reason === "string") {
        return new Error(failure.reason);
      }

      return new Error("Unknown generation failure");
    });

    throw new AggregateError(
      reasons,
      "Failed to complete all list generations",
    );
  }
}
