function sanitizeCell(value: string): string {
  const cleaned = value
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
