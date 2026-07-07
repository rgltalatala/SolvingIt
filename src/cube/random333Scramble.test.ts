import { describe, expect, it } from 'vitest';
import { parseFaceTurnAlgToMoves } from './parseFaceTurnAlg';
import {
  generateRandom333Scramble,
  RANDOM_333_SCRAMBLE_LENGTH,
} from './random333Scramble';

const TOKEN = /^([UDFBRL])(2|')?$/u;
const OPPOSITE: Record<string, string> = {
  U: 'D',
  D: 'U',
  F: 'B',
  B: 'F',
  L: 'R',
  R: 'L',
};

describe('generateRandom333Scramble', () => {
  it('returns a valid face-turn alg', () => {
    const alg = generateRandom333Scramble();
    const tokens = alg.trim().split(/\s+/);
    expect(tokens).toHaveLength(RANDOM_333_SCRAMBLE_LENGTH);
    expect(() => parseFaceTurnAlgToMoves(alg)).not.toThrow();
    for (const token of tokens) {
      expect(token).toMatch(TOKEN);
    }
  });

  it('avoids consecutive same or opposite faces', () => {
    for (let i = 0; i < 50; i += 1) {
      const tokens = generateRandom333Scramble().split(/\s+/);
      for (let j = 1; j < tokens.length; j += 1) {
        const prev = tokens[j - 1]![0];
        const next = tokens[j]![0];
        expect(next).not.toBe(prev);
        expect(OPPOSITE[next]).not.toBe(prev);
      }
    }
  });
});
