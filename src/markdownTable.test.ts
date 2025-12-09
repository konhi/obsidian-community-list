import { describe, expect, test } from "bun:test";
import { createMarkdownTable } from "./markdownTable";

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
