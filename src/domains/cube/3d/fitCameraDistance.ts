/**
 * Perspective distance from the target so a sphere of `radius` fits in the
 * viewport for the given vertical FOV and aspect ratio (width / height).
 */
export function cameraDistanceToFitSphere(
  radius: number,
  fovDeg: number,
  aspect: number,
): number {
  const safeAspect = Math.max(aspect, 1e-6);
  const vFov = (fovDeg * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * safeAspect);
  const distV = radius / Math.sin(vFov / 2);
  const distH = radius / Math.sin(hFov / 2);
  return Math.max(distV, distH);
}

/** Bounding sphere covering the sticker cube (corner ~1.46√3) with margin. */
export const CUBE_VIEW_FIT_RADIUS = 2.85;

/** Extra room for face letter callouts in the notation guide. */
export const CUBE_VIEW_FIT_RADIUS_WITH_LABELS = 3.7;
