import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ReactNode, RefObject } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PerspectiveCamera, type Group } from 'three';
import type { CubeState, Face } from '@/domains/cube/cubeState';
import type { DisplayCubeState } from '@/domains/cube/3d/cubeGeometry';
import { isWholeCubeRotation } from '@/domains/cube/cubeState';
import type { CubeAnatomyHighlight } from '@/domains/cube/3d/cubeAnatomy';
import { AnimatedCubeMesh, type CubeMoveAnimation } from '@/domains/cube/3d/AnimatedCubeMesh';
import { FaceAnatomyLabels } from '@/domains/cube/3d/FaceAnatomyLabels';
import {
  cameraDistanceToFitSphere,
  CUBE_VIEW_FIT_RADIUS,
  CUBE_VIEW_FIT_RADIUS_WITH_LABELS,
} from '@/domains/cube/3d/fitCameraDistance';
import {
  captureLessonCamera,
  snapLessonCamera,
  type LessonCameraSnapshot,
  type LessonCameraView,
} from '@/domains/cube/3d/lessonCamera';

export type { CubeMoveAnimation, LessonCameraView };

export interface CubeViewProps {
  cubeState: CubeState | DisplayCubeState;
  /** Optional radians [x,y,z] applied to the assembled cube (e.g. π on X = flip for white-down / yellow-up hold). */
  meshRotation?: [number, number, number];
  /** Outer frame height/layout (default tall preview). */
  frameClassName?: string;
  /** Stable key so multiple canvases on one page get distinct WebGL roots (e.g. main lesson vs move demo). */
  canvasKey?: string;
  /** When set, animates one move on top of `cubeState` (pre-move state) before calling `onComplete`. */
  moveAnimation?: CubeMoveAnimation | null;
  /** When this changes, the canonical lesson camera baseline is re-captured on next controls update. */
  cameraBaselineKey?: string;
  /** Snap orbit to lesson hold when a whole-cube rotation animates (off for notation guide). */
  snapCameraOnWholeCubeRotation?: boolean;
  /** Allow drag-to-orbit (off for notation guide so face letters stay aligned with the view). */
  enableOrbitControls?: boolean;
  /** Override sticker colors for notation anatomy tabs. */
  anatomyHighlight?: CubeAnatomyHighlight | null;
  /** Face letter labels for the notation face-names tab. */
  faceLabels?: { highlightedFace: Face | null };
  /** Slowly spin the cube (e.g. solve celebration). Disables orbit controls. */
  autoRotate?: boolean;
}

const AUTO_ROTATE_SPEED = 0.35;
const DEFAULT_CAMERA_POSITION: [number, number, number] = [5.5, 4.2, 5.5];
const DEFAULT_CAMERA_FOV = 42;

function AutoRotateGroup({
  rotation,
  autoRotate,
  children,
}: {
  rotation: [number, number, number];
  autoRotate: boolean;
  children: ReactNode;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * AUTO_ROTATE_SPEED;
    }
  });

  return (
    <group ref={groupRef} rotation={rotation}>
      {children}
    </group>
  );
}

/** Keep the cube fully framed when the canvas aspect ratio changes. */
function FitCubeCamera({
  radius,
  controlsRef,
}: {
  radius: number;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, size } = useThree();
  const lastFitKeyRef = useRef('');

  useFrame(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const controls = controlsRef.current;
    const fitKey = `${size.width}x${size.height}:${radius}:${controls ? 1 : 0}`;
    if (fitKey === lastFitKeyRef.current) return;
    lastFitKeyRef.current = fitKey;

    const aspect = size.width / Math.max(size.height, 1);
    const distance = cameraDistanceToFitSphere(radius, camera.fov, aspect);
    if (controls) {
      // Raise limits before moving so OrbitControls won't clamp the fit distance.
      controls.minDistance = Math.min(5, distance * 0.85);
      controls.maxDistance = Math.max(11, distance * 1.35);
    }
    const target = controls?.target;
    const offsetX = camera.position.x - (target?.x ?? 0);
    const offsetY = camera.position.y - (target?.y ?? 0);
    const offsetZ = camera.position.z - (target?.z ?? 0);
    const length = Math.hypot(offsetX, offsetY, offsetZ) || 1;
    const scale = distance / length;
    camera.position.set(
      (target?.x ?? 0) + offsetX * scale,
      (target?.y ?? 0) + offsetY * scale,
      (target?.z ?? 0) + offsetZ * scale,
    );
    camera.updateProjectionMatrix();
    controls?.update();
  });

  return null;
}

export function CubeView({
  cubeState,
  meshRotation = [0, 0, 0],
  frameClassName = 'h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950',
  canvasKey = 'cube-canvas',
  moveAnimation = null,
  cameraBaselineKey = 'default',
  snapCameraOnWholeCubeRotation = true,
  enableOrbitControls = true,
  anatomyHighlight = null,
  faceLabels,
  autoRotate = false,
}: CubeViewProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const lessonCameraRef = useRef<LessonCameraSnapshot | null>(null);
  const baselineKeyRef = useRef(cameraBaselineKey);

  useEffect(() => {
    if (baselineKeyRef.current !== cameraBaselineKey) {
      baselineKeyRef.current = cameraBaselineKey;
      lessonCameraRef.current = null;
    }
  }, [cameraBaselineKey]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    lessonCameraRef.current = captureLessonCamera(controls);
  }, [cameraBaselineKey]);

  useEffect(() => {
    if (
      !snapCameraOnWholeCubeRotation ||
      !moveAnimation ||
      !isWholeCubeRotation(moveAnimation.move)
    )
      return;
    const controls = controlsRef.current;
    const baseline = lessonCameraRef.current;
    if (!controls || !baseline) return;
    snapLessonCamera(controls, baseline, 'lessonHold');
  }, [moveAnimation, snapCameraOnWholeCubeRotation]);

  const handleAnimationComplete = () => {
    const controls = controlsRef.current;
    const baseline = lessonCameraRef.current;
    if (moveAnimation?.cameraAfter && controls && baseline) {
      snapLessonCamera(controls, baseline, moveAnimation.cameraAfter);
    }
    moveAnimation?.onComplete();
  };

  const activeAnimation = moveAnimation
    ? { ...moveAnimation, onComplete: handleAnimationComplete }
    : null;

  const fitRadius = faceLabels
    ? CUBE_VIEW_FIT_RADIUS_WITH_LABELS
    : CUBE_VIEW_FIT_RADIUS;

  return (
    <div className={frameClassName}>
      <Canvas
        key={canvasKey}
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: DEFAULT_CAMERA_FOV }}
        shadows
      >
        <ambientLight intensity={0.62} />
        <directionalLight position={[6, 8, 5]} intensity={0.9} castShadow />
        <directionalLight position={[-5, 4, -4]} intensity={0.4} />
        <AutoRotateGroup rotation={meshRotation} autoRotate={autoRotate}>
          <AnimatedCubeMesh
            cubeState={cubeState}
            animation={activeAnimation}
            anatomyHighlight={anatomyHighlight}
          />
          {faceLabels ? (
            <FaceAnatomyLabels highlightedFace={faceLabels.highlightedFace} />
          ) : null}
        </AutoRotateGroup>

        <OrbitControls
          ref={(node) => {
            controlsRef.current = node;
            if (node && !lessonCameraRef.current) {
              lessonCameraRef.current = captureLessonCamera(node);
            }
          }}
          enabled={enableOrbitControls && !autoRotate}
          enablePan={false}
          minDistance={5}
          maxDistance={11}
        />
        <FitCubeCamera radius={fitRadius} controlsRef={controlsRef} />
      </Canvas>
    </div>
  );
}
