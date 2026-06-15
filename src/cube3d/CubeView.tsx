import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CubeState } from '../cube/cubeState';
import { isWholeCubeRotation } from '../cube/cubeState';
import { AnimatedCubeMesh, type CubeMoveAnimation } from './AnimatedCubeMesh';
import {
  captureLessonCamera,
  snapLessonCamera,
  type LessonCameraSnapshot,
  type LessonCameraView,
} from './lessonCamera';

export type { CubeMoveAnimation, LessonCameraView };

export interface CubeViewProps {
  cubeState: CubeState;
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
}

export function CubeView({
  cubeState,
  meshRotation = [0, 0, 0],
  frameClassName = 'h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950',
  canvasKey = 'cube-canvas',
  moveAnimation = null,
  cameraBaselineKey = 'default',
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
    if (!moveAnimation || !isWholeCubeRotation(moveAnimation.move)) return;
    const controls = controlsRef.current;
    const baseline = lessonCameraRef.current;
    if (!controls || !baseline) return;
    snapLessonCamera(controls, baseline, 'lessonHold');
  }, [moveAnimation]);

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
        <group rotation={meshRotation}>
          <AnimatedCubeMesh cubeState={cubeState} animation={activeAnimation} />
        </group>

        <OrbitControls
          ref={(node) => {
            controlsRef.current = node;
            if (node && !lessonCameraRef.current) {
              lessonCameraRef.current = captureLessonCamera(node);
            }
          }}
          enablePan={false}
          minDistance={5}
          maxDistance={11}
        />
      </Canvas>
    </div>
  );
}
