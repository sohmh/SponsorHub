/**
 * Utility to export an array of tabular objects to a downloadable CSV file.
 * Handles escaping of commas, quotes, and newlines.
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers?: { key: keyof T; label: string }[]
) {
  if (!rows || rows.length === 0) {
    return;
  }

  const keys = headers ? headers.map((h) => h.key) : (Object.keys(rows[0]) as (keyof T)[]);
  const headerLabels = headers ? headers.map((h) => h.label) : keys.map(String);

  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    let str = typeof val === "object" && !(val instanceof Date) ? JSON.stringify(val) : String(val);
    if (val instanceof Date) {
      str = val.toISOString().split("T")[0];
    }
    // Escape double quotes by doubling them
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvRows: string[] = [];
  // Header row
  csvRows.push(headerLabels.map((l) => `"${l.replace(/"/g, '""')}"`).join(","));

  // Data rows
  for (const row of rows) {
    const line = keys.map((k) => escapeCell(row[k])).join(",");
    csvRows.push(line);
  }

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\r\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  const cleanFilename = `${filename.replace(/\.[^/.]+$/, "")}_${new Date().toISOString().split("T")[0]}.csv`;
  link.setAttribute("download", cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
