/**
 * Reading the guide (guide.md) without a Markdown library: its front matter, its headings and
 * its sources, for the page's table of contents, its structured data and the tests. The page
 * itself renders the Markdown with Astro.
 */
export interface GuideMeta {
  title: string;
  description: string;
  /** The day the guide was last changed, as YYYY-MM-DD. */
  updated: string;
}

export interface GuideHeading {
  level: 2 | 3;
  text: string;
  /** The heading's address on the page: /guide#primate-cities. */
  id: string;
}

/** A heading's address: lower case, words joined by hyphens. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The guide split into its front matter and its text. */
export function parseGuide(markdown: string): { meta: GuideMeta; body: string } {
  const found = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(markdown);
  const fields: Record<string, string> = {};
  for (const line of (found?.[1] ?? '').split(/\r?\n/)) {
    const pair = /^([a-z]+):\s*(.*)$/.exec(line);
    if (pair) fields[pair[1] as string] = (pair[2] ?? '').replace(/^"(.*)"$/, '$1');
  }
  return {
    meta: { title: fields.title ?? '', description: fields.description ?? '', updated: fields.updated ?? '' },
    body: found?.[2] ?? markdown,
  };
}

/** The guide's second- and third-level headings, in order. */
export function guideHeadings(body: string): GuideHeading[] {
  const headings: GuideHeading[] = [];
  for (const line of body.split(/\r?\n/)) {
    const found = /^(##|###) (.+)$/.exec(line);
    if (found) headings.push({ level: found[1] === '##' ? 2 : 3, text: (found[2] ?? '').trim(), id: headingId(found[2] ?? '') });
  }
  return headings;
}

/** The numbered sources at the end of the guide, as Markdown, in order. */
export function guideSources(body: string): string[] {
  const at = body.indexOf('\n## Sources');
  if (at < 0) return [];
  return body
    .slice(at)
    .split(/\r?\n/)
    .map((line) => /^\d+\. (.+)$/.exec(line)?.[1])
    .filter((line): line is string => typeof line === 'string');
}
