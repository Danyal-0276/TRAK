import { jsPDF } from 'jspdf';
import { normalizeArticleForDetail } from './articleNavigation';
import { getFeedItemCredibilityMeta } from './credibilityIndicator';
import { buildArticleShareUrl } from './articleShare';
import { getUserArticleDetail } from './Service/api';
import { mapApiItem } from './loadFeed';
import { getCachedArticleDetail, setCachedArticleDetail } from './articleDetailCache';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const BRAND = { r: 15, g: 23, b: 42 };
const MUTED = { r: 100, g: 116, b: 139 };
const BODY = { r: 30, g: 41, b: 59 };
const BOTTOM_MARGIN = MARGIN;

/** Normalize text so jsPDF Helvetica measures and wraps reliably. */
function sanitizePdfText(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .replace(/[\u2018\u2019\u2032\u0060\u00b4]/g, "'")
    .replace(/[\u201c\u201d\u2033]/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/\s+;/g, ';')
    .replace(/\s+:/g, ':')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function splitPdfLines(doc, text, maxWidth) {
  const clean = sanitizePdfText(text);
  if (!clean) return [];
  return doc.splitTextToSize(clean, maxWidth);
}

function writePdfLines(doc, lines, startY, opts = {}) {
  const { lineHeight = 5.2, fontSize = 10.5, fontStyle = 'normal', color = BODY } = opts;
  let y = startY;
  doc.setFont('helvetica', fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(color.r, color.g, color.b);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight + 1);
    doc.text(line, MARGIN, y);
    y += lineHeight;
  }
  return y;
}

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return { r: 100, g: 116, b: 139 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function formatPublished(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function ensureSpace(doc, y, needed = 14) {
  if (y + needed <= PAGE_H - BOTTOM_MARGIN) return y;
  doc.addPage();
  return MARGIN + 4;
}

function writeParagraphs(doc, text, startY, opts = {}) {
  const { fontSize = 10.5, lineHeight = 5.2, color = BODY } = opts;
  let y = startY;
  const raw = sanitizePdfText(text);
  const blocks = raw
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = splitPdfLines(doc, block, CONTENT_W);
    y = writePdfLines(doc, lines, y, { fontSize, lineHeight, color });
    y += 4;
  }
  return y;
}

function writeSectionTitle(doc, label, y) {
  y = ensureSpace(doc, y, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  doc.text(label, MARGIN, y);
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
  return y + 10;
}

function articleBodyText(article) {
  return String(
    article?.fullContent || article?.full_content || article?.content || ''
  ).trim();
}

function articleSummaryText(article) {
  return String(
    article?.summary || article?.excerpt || article?.ai_summary || article?.description || ''
  ).trim();
}

/** Feed cards often only carry summary — fetch full detail when body is missing or truncated. */
function needsFullArticleFetch(article) {
  const body = articleBodyText(article);
  const summary = articleSummaryText(article);
  if (!body) return true;
  if (body.length < 200) return true;
  if (summary && body.length <= summary.length + 80) return true;
  return false;
}

export async function resolveArticleForPdfExport(item) {
  const normalized = normalizeArticleForDetail(item);
  if (!needsFullArticleFetch(normalized)) return normalized;

  const id = String(normalized.id || item?.id || item?.article_id || '').trim();
  if (!id) return normalized;

  try {
    let doc = getCachedArticleDetail(id);
    if (!doc) {
      doc = await getUserArticleDetail(id);
      if (doc) setCachedArticleDetail(id, doc);
    }
    if (!doc) return normalized;
    return normalizeArticleForDetail(mapApiItem({ ...doc, id }));
  } catch {
    return normalized;
  }
}

/** Build a formatted TRAK article PDF (summary, body, credibility). */
export function createArticlePdfDocument(item) {
  const article = normalizeArticleForDetail(item);
  const cred = getFeedItemCredibilityMeta(article);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, PAGE_W, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('TRAK', MARGIN, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Credibility-first news', MARGIN, 21);

  let y = 38;
  const title = sanitizePdfText(article.title || 'Untitled');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  const titleLines = splitPdfLines(doc, title, CONTENT_W);
  y = writePdfLines(doc, titleLines, y, { fontSize: 16, lineHeight: 7.2, fontStyle: 'bold', color: BRAND });
  y += 4;

  const metaParts = [
    article.source ? `Source: ${article.source}` : '',
    formatPublished(article.published_at || article.time) ? `Published: ${formatPublished(article.published_at || article.time)}` : '',
    article.category ? `Category: ${article.category}` : '',
  ].filter(Boolean);
  if (metaParts.length) {
    const metaLines = splitPdfLines(doc, metaParts.join('  •  '), CONTENT_W);
    y = writePdfLines(doc, metaLines, y, { fontSize: 9, lineHeight: 4.2, color: MUTED });
    y += 4;
  }

  if (cred?.show) {
    y = ensureSpace(doc, y, 22);
    const rgb = hexToRgb(cred.style?.color);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(MARGIN, y - 5, CONTENT_W, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const scoreText = cred.score != null ? `  •  Score ${cred.score}/100` : '';
    const credLine = sanitizePdfText(`Credibility: ${cred.labelName || 'Unknown'}${scoreText}`);
    const credLines = splitPdfLines(doc, credLine, CONTENT_W - 8);
    doc.text(credLines[0] || credLine, MARGIN + 4, y + 3);
    y += 16;
  }

  const summary = sanitizePdfText(
    article.summary || article.excerpt || article.ai_summary || ''
  );
  const body = sanitizePdfText(article.fullContent || article.content || '');

  if (summary) {
    y = writeSectionTitle(doc, 'Summary', y);
    y = writeParagraphs(doc, summary, y, { fontSize: 10.5 });
    y += 2;
  }

  if (body) {
    y = writeSectionTitle(doc, 'Full article', y);
    y = writeParagraphs(doc, body, y, { fontSize: 10.5 });
  } else if (!summary) {
    y = writeSectionTitle(doc, 'Article', y);
    y = writeParagraphs(doc, 'Full article text is not available in this export.', y, {
      color: MUTED,
    });
  }

  y = ensureSpace(doc, y, 20);
  doc.setDrawColor(226, 232, 240);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  const shareUrl = buildArticleShareUrl(article);
  doc.text(`Exported from TRAK on ${new Date().toLocaleString()}`, MARGIN, y);
  y += 4;
  const linkLines = splitPdfLines(doc, `Read online: ${shareUrl}`, CONTENT_W);
  y = writePdfLines(doc, linkLines, y, { fontSize: 8.5, lineHeight: 4, color: MUTED });

  return doc;
}

export async function downloadArticlePdf(item) {
  const article = await resolveArticleForPdfExport(item);
  const id = String(article.id || 'article').replace(/[^\w.-]+/g, '_');
  const doc = createArticlePdfDocument(article);
  doc.save(`trak-article-${id}.pdf`);
}
