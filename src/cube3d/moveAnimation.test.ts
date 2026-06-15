import { describe, expect, it } from 'vitest';
import { cubieOnFaceLayer, getMoveAnimationSpec } from './moveAnimation';

describe('moveAnimation', () => {
  it('classifies face vs whole-cube moves', () => {
    expect(getMoveAnimationSpec('R').kind).toBe('face');
    expect(getMoveAnimationSpec('y2').kind).toBe('whole');
  });

  it('assigns cubies to face layers', () => {
    expect(cubieOnFaceLayer([1, 0, 0], 'R')).toBe(true);
    expect(cubieOnFaceLayer([0, 0, 0], 'R')).toBe(false);
    expect(cubieOnFaceLayer([0, 1, 0], 'U')).toBe(true);
  });

  it('prime moves animate one quarter turn, not three', () => {
    const cw = getMoveAnimationSpec('D');
    const ccw = getMoveAnimationSpec("D'");
    expect(Math.abs(cw.angle)).toBeCloseTo(Math.PI / 2, 5);
    expect(Math.abs(ccw.angle)).toBeCloseTo(Math.PI / 2, 5);
    expect(Math.sign(cw.angle)).toBe(-Math.sign(ccw.angle));
  });
});
