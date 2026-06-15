import type { Face, FaceMove, Move } from './cubeState';

/** Basic WCA-style face turns only (no wide / slice / rotations). */
const TOKEN = /^([UDFBRL])(2|')?$/u;

/**
 * Parse a space-separated alg like `"R U R' U2"` into {@link Move}s applied from solved storage orientation.
 * Throws if a token is not a plain face quarter/half turn.
 */
export function parseFaceTurnAlgToMoves(algString: string): Move[] {
  const tokens = algString.trim().split(/\s+/).filter(Boolean);
  const out: Move[] = [];
  for (const t of tokens) {
    const m = t.match(TOKEN);
    if (!m) {
      throw new Error(
        `Unsupported scramble token "${t}" (only U/D/F/B/L/R with optional 2 or ')`,
      );
    }
    const face = m[1] as Face;
    const suf = m[2];
    const mv = (
      suf === '2' ? `${face}2` : suf === "'" || suf === '′' ? `${face}'` : face
    ) as FaceMove;
    out.push(mv);
  }
  return out;
}
