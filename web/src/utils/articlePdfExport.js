import { jsPDF } from 'jspdf';
import { normalizeArticleForDetail } from './articleNavigation';
import { getFeedItemCredibilityMeta } from './credibilityIndicator';
import { buildArticleShareUrl } from './articleShare';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

const BRAND = { r: 15, g: 23, b: 42 };
const MUTED = { r: 100, g: 116, b: 139 };
const BODY = { r: 30, g: 41, b: 59 };

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
  if (y + needed <= PAGE_H - MARGIN) return y;
  doc.addPage();
  return MARGIN + 4;
}

function writeParagraphs(doc, text, startY, opts = {}) {
  const { fontSize = 10.5, lineHeight = 5.2, color = BODY } = opts;
  let y = startY;
  const blocks = String(text || '')
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(color.r, color.g, color.b);

  for (const block of blocks) {
    const lines = doc.splitTextToSize(block, CONTENT_W);
    y = ensureSpace(doc, y, lines.length * lineHeight + 4);
    doc.text(lines, MARGIN, y);
    y += lines.length * lineHeight + 4;
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
  const title = String(article.title || 'Untitled').trim();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(BRAND.r, BRAND.g, BRAND.b);
  const titleLines = doc.splitTextToSize(title, CONTENT_W);
  doc.text(titleLines, MARGIN, y);
  y += titleLines.length * 7.5 + 4;

  const metaParts = [
    article.source ? `Source: ${article.source}` : '',
    formatPublished(article.published_at || article.time) ? `Published: ${formatPublished(article.published_at || article.time)}` : '',
    article.category ? `Category: ${article.category}` : '',
  ].filter(Boolean);
  if (metaParts.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(metaParts.join('  •  '), MARGIN, y);
    y += 8;
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
    doc.text(`Credibility: ${cred.labelName || 'Unknown'}${scoreText}`, MARGIN + 4, y + 3);
    y += 16;
  }

  const summary = String(
    article.summary || article.excerpt || article.ai_summary || ''
  ).trim();
  const body = String(article.fullContent || article.content || '').trim();

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
  const linkLines = doc.splitTextToSize(`Read online: ${shareUrl}`, CONTENT_W);
  doc.text(linkLines, MARGIN, y);

  return doc;
}

export function downloadArticlePdf(item) {
  const article = normalizeArticleForDetail(item);
  const id = String(article.id || 'article').replace(/[^\w.-]+/g, '_');
  const doc = createArticlePdfDocument(item);
  doc.save(`trak-article-${id}.pdf`);
}
