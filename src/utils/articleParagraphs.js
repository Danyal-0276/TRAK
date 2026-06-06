import { isNavBoilerplateLine } from './articleTextSanitize';

/**
 * Split article body into display paragraphs (preserves \n\n from scrapers;
 * falls back to sentence boundaries when pipeline flattened whitespace).
 */
export function splitArticleParagraphs(text) {
  const normalized = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
  if (!normalized) return [];

  let parts = normalized
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p && !isNavBoilerplateLine(p));

  if (parts.length <= 1 && normalized.length > 280) {
    parts = normalized
      .split(/(?<=[.!?…])\s+(?=[A-Z0-9"'(\[])/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter((p) => p.length > 0);
  }

  return parts.length > 0 ? parts : [normalized.replace(/\s+/g, ' ').trim()];
}
