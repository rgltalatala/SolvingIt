import { describe, expect, it } from 'vitest';
import { parseFaceTurnAlgToMoves } from './parseFaceTurnAlg';

describe('parseFaceTurnAlgToMoves', () => {
  it('parses primes, doubles, and bare faces', () => {
    expect(parseFaceTurnAlgToMoves("R U R' U2")).toEqual([
      'R',
      'U',
      "R'",
      'U2',
    ]);
  });

  it('throws on wide moves', () => {
    expect(() => parseFaceTurnAlgToMoves('Rw')).toThrow(/Unsupported/);
  });
});
