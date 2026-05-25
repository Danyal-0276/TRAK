import { planSegmentsProgressive } from './ttsChunking';
import { splitArticleParagraphs } from './articleParagraphs';

function normalizeWs(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function splitSentences(text) {
  const n = normalizeWs(text);
  if (!n) return [];
  const parts = n.split(/(?<=[.!?…])\s+/).filter(Boolean);
  return parts.length ? parts : [n];
}

/** Character ranges for each TTS segment in normalized listen text. */
export function buildListenSegmentRanges(listenText) {
  const segments = planSegmentsProgressive(listenText);
  const normalized = normalizeWs(listenText);
  let cursor = 0;
  return segments.map((seg) => {
    const normSeg = normalizeWs(seg);
    let start = normalized.indexOf(normSeg, cursor);
    if (start < 0) start = cursor;
    const end = start + normSeg.length;
    cursor = end;
    return { start, end, text: seg };
  });
}

function segmentIndexForOffset(ranges, offset) {
  if (!ranges.length) return 0;
  for (let i = 0; i < ranges.length; i++) {
    if (offset >= ranges[i].start && offset < ranges[i].end) return i;
  }
  return ranges.length - 1;
}

/**
 * Map visible article sentences to TTS segment indices (for karaoke-style highlight).
 */
export function buildHighlightLinesFromContent(content, listenText) {
  const listen = normalizeWs(listenText);
  if (!listen) return { lines: [], segments: [] };

  const ranges = buildListenSegmentRanges(listen);
  const lines = [];
  let searchFrom = 0;

  const paragraphs = splitArticleParagraphs(content);
  for (let pi = 0; pi < paragraphs.length; pi++) {
    for (const sent of splitSentences(paragraphs[pi])) {
      const normSent = normalizeWs(sent);
      if (!normSent) continue;
      let start = listen.indexOf(normSent, searchFrom);
      if (start < 0) start = listen.indexOf(normSent);
      if (start < 0) start = searchFrom;
      searchFrom = start + normSent.length;
      lines.push({
        text: sent,
        segmentIndex: segmentIndexForOffset(ranges, start),
        paragraphIndex: pi,
      });
    }
  }

  if (!lines.length && content) {
    const fallback = normalizeWs(String(content).slice(0, 500));
    if (fallback) {
      lines.push({
        text: fallback,
        segmentIndex: 0,
        paragraphIndex: 0,
      });
    }
  }

  return { lines, segments: ranges.map((r) => r.text) };
}

/** Line indices in `lines` that belong to a TTS segment. */
export function lineIndicesForSegment(lines, segmentIndex) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].segmentIndex === segmentIndex) out.push(i);
  }
  return out;
}

/**
 * Schedule onLine(index) proportionally across durationMs (clears prior timers via returned cancel).
 */
export function scheduleLineHighlights(lineIndices, lines, durationMs, onLine, isCancelled) {
  const timers = [];
  const cancel = () => timers.forEach((t) => clearTimeout(t));

  if (!lineIndices.length || durationMs <= 0) {
    return cancel;
  }

  const weights = lineIndices.map((i) => Math.max(1, lines[i]?.text?.length || 1));
  const total = weights.reduce((a, b) => a + b, 0) || 1;

  if (!isCancelled?.()) onLine(lineIndices[0]);

  let elapsed = 0;
  for (let j = 1; j < lineIndices.length; j++) {
    elapsed += Math.round((weights[j - 1] / total) * durationMs);
    const lineIdx = lineIndices[j];
    const t = setTimeout(() => {
      if (!isCancelled?.()) onLine(lineIdx);
    }, elapsed);
    timers.push(t);
  }

  return cancel;
}
