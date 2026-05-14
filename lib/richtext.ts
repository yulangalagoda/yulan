// Helpers for extracting plain text and rendering rich text from Notion responses.

type NotionRichText = Array<{ plain_text?: string }>;

export function plainText(rt: NotionRichText | undefined): string {
  if (!rt || !Array.isArray(rt)) return '';
  return rt.map((t) => t.plain_text ?? '').join('').trim();
}

/**
 * Splits a Notion text field on <br>, <br/>, <br />, or literal newlines.
 * Returns an array of non-empty trimmed strings.
 */
export function splitHighlights(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/<br\s*\/?>|\n/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Splits a comma-separated multi-select-ish field. Useful for "Technologies" or
 * "Keywords" properties that the user may have entered as plain text.
 */
export function splitList(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Renders inline content with a very small set of allowed tags (<strong>, <em>, <a>).
 * For now we just pass through plain text since Notion text doesn't carry markup
 * unless the editor uses Notion's own formatting. Component-level rendering handles
 * paragraph splitting.
 */
export function paragraphs(text: string | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
