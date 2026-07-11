import { describe, expect, it } from 'vitest';
import {
  edgeIdentity,
  edgeProgressLabel,
  whiteCornerIdentity,
  whiteCornerProgressLabel,
  whiteEdgeIdentity,
  whiteEdgeProgressLabel,
  yellowCornerIdentity,
  yellowEdgeIdentity,
} from './pieceIdentity';

describe('pieceIdentity', () => {
  it('formats white edge identity and progress labels', () => {
    expect(whiteEdgeIdentity('blue')).toBe('White–Blue Edge');
    expect(whiteEdgeProgressLabel('blue')).toBe('White–Blue');
  });

  it('formats side edge identity', () => {
    expect(edgeIdentity('green', 'orange')).toBe('Green–Orange Edge');
    expect(edgeProgressLabel('green', 'orange')).toBe('Green–Orange');
  });

  it('formats white and yellow corner identity', () => {
    expect(whiteCornerIdentity('blue', 'red')).toBe('White–Blue–Red Corner');
    expect(whiteCornerProgressLabel('blue', 'red')).toBe('White–Blue–Red');
    expect(yellowCornerIdentity('green', 'orange')).toBe(
      'Yellow–Green–Orange Corner',
    );
  });

  it('formats yellow edge identity', () => {
    expect(yellowEdgeIdentity('red')).toBe('Yellow–Red Edge');
  });
});
