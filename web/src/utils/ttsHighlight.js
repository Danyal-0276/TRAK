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
      lines.push({ text: fallback, segmentIndex: 0, paragraphIndex: 0 });
    }
  }

  return { lines, segments: ranges.map((r) => r.text) };
}

export function lineIndicesForSegment(lines, segmentIndex) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].segmentIndex === segmentIndex) out.push(i);
  }
  return out;
}

export function scheduleLineHighlights(
  lineIndices,
  lines,
  durationMs,
  onLine,
  isCancelled,
  { startLineOffset = 0, elapsedMs = 0 } = {}
) {
  const timers = [];
  let paused = false;
  let pauseStartedAt = 0;
  let totalPausedMs = 0;
  let nextLineIdx = Math.max(0, Math.min(startLineOffset, lineIndices.length - 1));

  const clearTimers = () => {
    timers.forEach((t) => clearTimeout(t));
    timers.length = 0;
  };

  const cancel = () => {
    clearTimers();
    paused = false;
  };

  const scheduleFrom = (fromLineIdx, fromElapsedMs) => {
    clearTimers();
    if (!lineIndices.length || durationMs <= 0 || paused) return;

    const remainingMs = Math.max(0, durationMs - (fromElapsedMs || 0));
    const weights = lineIndices.map((i) => Math.max(1, lines[i]?.text?.length || 1));
    const total = weights.reduce((a, b) => a + b, 0) || 1;

    const startIdx = Math.max(0, Math.min(fromLineIdx, lineIndices.length - 1));
    nextLineIdx = startIdx;
    if (!isCancelled?.() && !paused) onLine(lineIndices[startIdx]);

    let elapsed = 0;
    for (let j = startIdx + 1; j < lineIndices.length; j++) {
      elapsed += Math.round((weights[j - 1] / total) * remainingMs);
      const lineIdx = lineIndices[j];
      const fireAt = elapsed;
      const t = setTimeout(() => {
        if (isCancelled?.() || paused) return;
        nextLineIdx = j;
        onLine(lineIdx);
      }, fireAt + totalPausedMs);
      timers.push(t);
    }
  };

  const pause = () => {
    if (paused) return;
    paused = true;
    pauseStartedAt = Date.now();
    clearTimers();
  };

  const resume = () => {
    if (!paused) return;
    totalPausedMs += Date.now() - pauseStartedAt;
    paused = false;
    pauseStartedAt = 0;
    scheduleFrom(nextLineIdx, elapsedMs);
  };

  if (!lineIndices.length || durationMs <= 0) {
    return { cancel, pause, resume };
  }

  scheduleFrom(
    Math.max(0, Math.min(startLineOffset, lineIndices.length - 1)),
    elapsedMs || 0
  );

  return { cancel, pause, resume };
}
