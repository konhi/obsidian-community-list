import { describe, expect, test } from "bun:test";
import {
  normalizePlugins,
  normalizeThemes,
  renderPluginTable,
  renderThemeTable,
} from "./generator";

describe("normalizePlugins", () => {
  test("drops invalid items and preserves descriptions", () => {
    const payload = [
      { name: "Sample", repo: "owner/repo", description: "desc" },
      { name: "Missing repo" },
      { repo: "owner/only" },
    ];

    const normalized = normalizePlugins(payload);

    expect(normalized).toEqual([
      { name: "Sample", repo: "owner/repo", description: "desc" },
    ]);
  });
});

describe("normalizeThemes", () => {
  test("requires name, repo and screenshot", () => {
    const payload = [
      { name: "Theme", repo: "owner/theme", screenshot: "shot.png" },
      { name: "Theme", repo: "owner/theme" },
    ];

    const normalized = normalizeThemes(payload);

    expect(normalized).toEqual([
      { name: "Theme", repo: "owner/theme", screenshot: "shot.png" },
    ]);
  });
});

describe("renderers", () => {
  test("renderPluginTable substitutes empty description", () => {
    const table = renderPluginTable([
      { name: "Plugin", repo: "owner/plugin", description: "" },
    ]);

    expect(table.includes("—")).toBe(true);
  });

  test("renderThemeTable embeds screenshot URLs", () => {
    const table = renderThemeTable([
      { name: "Theme", repo: "owner/theme", screenshot: "shot.png" },
    ]);

    expect(table).toContain("shot.png");
  });
});
