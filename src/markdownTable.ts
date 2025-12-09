function sanitizeCell(value: string): string {
  const cleaned = value
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br />")
    .trim();

  return cleaned.length > 0 ? cleaned : " ";
}

function normalizeRow(row: string[], columnCount: number): string[] {
  const normalized: string[] = [];

  for (let index = 0; index < columnCount; index += 1) {
    const cell = row[index] ?? "";
    normalized.push(sanitizeCell(cell));
  }

  return normalized;
}

export type ParsedMarkdownTable = {
  headers: string[];
  rows: string[][];
};

function splitRowIntoCells(row: string): string[] {
  const trimmed = row.trim();

  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    throw new Error(`Invalid table row: ${row}`);
  }

  const content = trimmed.slice(1, -1);
  const cells: string[] = [];
  let buffer = "";
  let index = 0;

  while (index < content.length) {
    const char = content[index];

    if (char === "\\") {
      const nextChar = content[index + 1];

      if (nextChar === "|") {
        buffer += "|";
        index += 2;
        continue;
      }

      buffer += "\\";
      index += 1;
      continue;
    }

    if (char === "|") {
      cells.push(buffer.trim());
      buffer = "";
      index += 1;
      continue;
    }

    buffer += char;
    index += 1;
  }

  cells.push(buffer.trim());

  return cells;
}

function isDividerCell(value: string): boolean {
  return /^:?-{3,}:?$/.test(value.trim());
}

function collectTableRows(markdown: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const rows: string[] = [];
  let buffer: string[] = [];

  const pushBuffer = (): void => {
    if (buffer.length > 0) {
      rows.push(buffer.join("\n"));
      buffer = [];
    }
  };

  for (const line of lines) {
    if (buffer.length === 0) {
      if (line.trim().length === 0) {
        continue;
      }

      if (!line.trimStart().startsWith("|")) {
        continue;
      }
    }

    buffer.push(line);

    if (line.trimEnd().endsWith("|")) {
      pushBuffer();
    }
  }

  pushBuffer();

  return rows;
}

export function createMarkdownTable(
  headers: string[],
  rows: string[][],
): string {
  if (headers.length === 0) {
    throw new Error("Cannot create a table without headers");
  }

  const columnCount = headers.length;
  const normalizedHeaders = headers.map(sanitizeCell);
  const normalizedRows = rows.map((row) => normalizeRow(row, columnCount));
  const headerLine = `| ${normalizedHeaders.join(" | ")} |`;
  const dividerLine = `| ${normalizedHeaders.map(() => "---").join(" | ")} |`;
  const rowLines = normalizedRows.map((row) => `| ${row.join(" | ")} |`);

  return [headerLine, dividerLine, ...rowLines].join("\n");
}

export function parseMarkdownTable(markdown: string): ParsedMarkdownTable {
  const rows = collectTableRows(markdown);

  if (rows.length < 2) {
    throw new Error("Markdown table must include headers and divider row");
  }

  const [headerRow, dividerRow, ...dataRows] = rows;

  if (!headerRow || !dividerRow) {
    throw new Error("Markdown table must include headers and divider row");
  }

  const headers = splitRowIntoCells(headerRow);
  const dividerCells = splitRowIntoCells(dividerRow);

  if (
    dividerCells.length !== headers.length ||
    !dividerCells.every(isDividerCell)
  ) {
    throw new Error("Invalid markdown table divider row");
  }

  const parsedRows = dataRows.map((row) => splitRowIntoCells(row));

  return { headers, rows: parsedRows };
}
