import { describe, expect, test } from "bun:test";
import { createMarkdownTable, parseMarkdownTable } from "./markdownTable";

describe("createMarkdownTable", () => {
  test("renders well-formed markdown with escaped characters", () => {
    const table = createMarkdownTable(
      ["📁 Name", "✨ Description"],
      [["alpha|beta", "line one\nline two"]],
    );

    expect(table).toBe(
      "| 📁 Name | ✨ Description |\n| --- | --- |\n| alpha\\|beta | line one<br />line two |",
    );
  });

  test("pads short rows to match header count", () => {
    const table = createMarkdownTable(["A", "B", "C"], [["x"]]);

    expect(table.endsWith("| x |   |   |")).toBe(true);
  });
});

describe("parseMarkdownTable", () => {
  test("handles rows that span multiple lines", () => {
    const markdown = [
      "| 📁 Name | ✨ Description |",
      "| --- | --- |",
      "| [Quick snippets and navigation](https://github.com/ieviev/obsidian-keyboard-shortcuts) | Keyboard navigation up/down for headings",
      "- Configurable default code block and callout",
      "- Copy code block via keyboard shortcut. |",
    ].join("\n");

    const parsed = parseMarkdownTable(markdown);

    expect(parsed.headers).toEqual(["📁 Name", "✨ Description"]);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]?.[1]).toBe(
      "Keyboard navigation up/down for headings\n- Configurable default code block and callout\n- Copy code block via keyboard shortcut.",
    );

    const regenerated = createMarkdownTable(parsed.headers, parsed.rows);

    expect(regenerated).toContain("<br />- Configurable default code block");
    expect(regenerated.includes("\n- Configurable")).toBe(false);
  });
});
