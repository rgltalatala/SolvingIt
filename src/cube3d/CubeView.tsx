import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { ReactNode } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Group } from 'three';
import type { CubeState, Face } from '../cube/cubeState';
import type { DisplayCubeState } from './cubeGeometry';
import { isWholeCubeRotation } from '../cube/cubeState';
import type { CubeAnatomyHighlight } from './cubeAnatomy';
import { AnimatedCubeMesh, type CubeMoveAnimation } from './AnimatedCubeMesh';
import { FaceAnatomyLabels } from './FaceAnatomyLabels';
import {
  captureLessonCamera,
  snapLessonCamera,
  type LessonCameraSnapshot,
  type LessonCameraView,
} from './lessonCamera';

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

  return (
    <div className={frameClassName}>
      <Canvas
        key={canvasKey}
        camera={{ position: [5.5, 4.2, 5.5], fov: 42 }}
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
      </Canvas>
    </div>
  );
}
