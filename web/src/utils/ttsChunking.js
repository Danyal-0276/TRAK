/** Keep in sync with TRAK-BACKEND/news/tts_service.py chunk settings. */
export const TTS_FIRST_CHUNK_CHARS = 100;
export const TTS_REST_CHUNK_CHARS = 240;

function chunkAtSize(cleaned, chunkSize) {
  if (cleaned.length <= chunkSize) return [cleaned];

  const parts = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const segments = [];
  let carry = '';

  const flush = () => {
    if (carry) {
      segments.push(carry);
      carry = '';
    }
  };

  for (const part of parts) {
    const bit = part.trim();
    if (!bit) continue;
    if (!carry) {
      carry = bit;
    } else if (`${carry} ${bit}`.length <= chunkSize) {
      carry = `${carry} ${bit}`;
    } else {
      flush();
      if (bit.length <= chunkSize) {
        carry = bit;
      } else {
        const words = bit.split(/\s+/);
        let buf = '';
        for (const w of words) {
          const next = buf ? `${buf} ${w}` : w;
          if (next.length > chunkSize && buf) {
            segments.push(buf);
            buf = w;
          } else {
            buf = next;
          }
        }
        if (buf) carry = buf;
      }
    }
  }
  flush();
  return segments.length ? segments : [cleaned.slice(0, chunkSize)];
}

/** Small first chunk → audio starts sooner; rest in ~320 char pieces. */
export function planSegmentsProgressive(
  text,
  firstSize = TTS_FIRST_CHUNK_CHARS,
  restSize = TTS_REST_CHUNK_CHARS,
  maxTotal = 40_000
) {
  let cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  if (cleaned.length > maxTotal) {
    const cut = cleaned.slice(0, maxTotal);
    const sp = cut.lastIndexOf(' ');
    cleaned = `${(sp > maxTotal * 0.6 ? cut.slice(0, sp) : cut).trim()} ...`;
  }
  if (cleaned.length <= firstSize) return [cleaned];

  const rest = chunkAtSize(cleaned, restSize);
  if (!rest.length) return [cleaned.slice(0, firstSize)];
  if (rest[0].length <= firstSize) return rest;

  const head = chunkAtSize(rest[0], firstSize);
  return [...head, ...rest.slice(1)];
}
