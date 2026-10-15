const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

const COENG = 0x17d2; // Khmer sign that joins a consonant to a subscript

/** Khmer dependent vowels and signs (incl. coeng): they extend the previous consonant. */
const isKhmerContinuation = (ch: string | undefined) => {
  if (!ch) return false;
  const code = ch.codePointAt(0)!;
  return (code >= 0x17b6 && code <= 0x17d3) || code === 0x17dd;
};

/**
 * Truncates to at most `maxUnits` UTF-16 code units (what `maxLength` and
 * `.length` count) without cutting through a character cluster. A plain
 * `.slice` can split surrogate pairs, emoji and Khmer syllables.
 *
 * Intl's grapheme segmentation keeps most clusters together but treats a
 * Khmer coeng + subscript (e.g. the "្រ" in "ក្រុម") as separate, so we also
 * back up while the cut would leave a dangling coeng or strand a vowel/sign
 * or subscript consonant from its base.
 */
export function truncateGraphemes(text: string, maxUnits: number): string {
  if (text.length <= maxUnits) return text;
  if (!segmenter) return text.slice(0, maxUnits);

  const segments: string[] = [];
  let length = 0;
  for (const { segment } of segmenter.segment(text)) {
    if (length + segment.length > maxUnits) break;
    segments.push(segment);
    length += segment.length;
  }

  while (segments.length > 0) {
    const out = segments.join("");
    const next = text[out.length];
    const dangling = out.charCodeAt(out.length - 1) === COENG;
    if (!dangling && !isKhmerContinuation(next)) break;
    segments.pop();
  }
  return segments.join("");
}
