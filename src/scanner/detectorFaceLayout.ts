import type { Face, FaceState } from '../cube/cubeState';

/**
 * Map the 3×3 grid from {@link detectFaceColorsFromImageData} (row 0 = top of the cropped frame,
 * col 0 = left) into the sticker slot order used by `cubeStateToCubeJsString` and
 * `cubeJsStickerSlots`.
 *
 * Only **U** needs remapping: scan instructions put the +F edge at the **top** of the frame, which
 * matches cubejs **front** row (slots 6–8), not the back row (0–2). We also mirror **left↔right**
 * on U so the sampled grid matches how the live preview aligns with L/R (other faces stay
 * row-major; a global horizontal remap on every face mirrored them vs the camera).
 */
export function detectorFaceToCubeJsFaceOrder(
  face: Face,
  detected: FaceState,
): FaceState {
  if (face !== 'U') return detected;

  const next = [...detected] as FaceState;
  for (let i = 0; i < 9; i += 1) {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const j = (2 - row) * 3 + (2 - col);
    next[j] = detected[i];
  }
  return next;
}
