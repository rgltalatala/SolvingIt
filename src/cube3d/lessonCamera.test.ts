import { describe, expect, it, vi } from 'vitest';
import { snapLessonCamera } from './lessonCamera';

describe('lessonCamera', () => {
  it('snaps to opposite azimuth from baseline, not cumulative user offset', () => {
    const controls = {
      getAzimuthalAngle: vi.fn(() => 2.5),
      getPolarAngle: vi.fn(() => 1.1),
      setAzimuthalAngle: vi.fn(),
      setPolarAngle: vi.fn(),
      update: vi.fn(),
    };
    const baseline = { azimuth: 0.8, polar: 1.1 };
    const result = snapLessonCamera(
      controls as never,
      baseline,
      'lessonHoldOpposite',
    );
    expect(result).toBeCloseTo(baseline.azimuth + Math.PI, 5);
    expect(controls.setAzimuthalAngle).toHaveBeenCalledWith(
      baseline.azimuth + Math.PI,
    );
    expect(controls.setPolarAngle).toHaveBeenCalledWith(baseline.polar);
  });
});
