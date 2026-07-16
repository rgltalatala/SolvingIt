import { describe, expect, it } from 'vitest';
import { cameraDistanceToFitSphere } from '@/domains/cube/3d/fitCameraDistance';

describe('cameraDistanceToFitSphere', () => {
  it('needs more distance when the viewport is tall and narrow', () => {
    const wide = cameraDistanceToFitSphere(2.85, 42, 2);
    const square = cameraDistanceToFitSphere(2.85, 42, 1);
    const narrow = cameraDistanceToFitSphere(2.85, 42, 0.45);
    // aspect >= 1 is limited by vertical FOV, so wide and square match
    expect(wide).toBeCloseTo(square, 5);
    expect(narrow).toBeGreaterThan(square);
  });

  it('scales linearly with radius', () => {
    const a = cameraDistanceToFitSphere(2, 42, 1);
    const b = cameraDistanceToFitSphere(4, 42, 1);
    expect(b / a).toBeCloseTo(2, 5);
  });
});
