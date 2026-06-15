import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export type LessonCameraView = 'lessonHold' | 'lessonHoldOpposite';

export type LessonCameraSnapshot = {
  azimuth: number;
  polar: number;
};

export function captureLessonCamera(
  controls: OrbitControlsImpl,
): LessonCameraSnapshot {
  return {
    azimuth: controls.getAzimuthalAngle(),
    polar: controls.getPolarAngle(),
  };
}

export function snapLessonCamera(
  controls: OrbitControlsImpl,
  snapshot: LessonCameraSnapshot,
  view: LessonCameraView,
): number {
  const azimuth =
    view === 'lessonHoldOpposite'
      ? snapshot.azimuth + Math.PI
      : snapshot.azimuth;
  controls.setAzimuthalAngle(azimuth);
  controls.setPolarAngle(snapshot.polar);
  controls.update();
  return azimuth;
}
