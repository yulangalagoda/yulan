// Stable, content-derived anchor ids for CV entries, so ORCID (and any deep
// link) can point at one specific experience/education card rather than the
// whole section. Ids are derived from the Notion-delivered role/qualification,
// so they track the content instead of a positional index. Collisions (e.g. two
// identical roles) get a numeric suffix in render order.
function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function anchorList<T>(rows: T[], prefix: string, label: (row: T) => string): string[] {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const base = `${prefix}-${slugify(label(row)) || 'item'}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  });
}
