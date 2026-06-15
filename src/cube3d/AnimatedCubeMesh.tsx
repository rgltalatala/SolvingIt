import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { CubeState, Move } from '../cube/cubeState';
import { Cubie } from './Cubie';
import { cubieDefinitions, getCubieFaceColors } from './cubeGeometry';
import {
  axisIndex,
  cubieOnFaceLayer,
  easeInOutCubic,
  getMoveAnimationSpec,
  MOVE_ANIMATION_MS,
  type MoveAnimationSpec,
} from './moveAnimation';
import type { LessonCameraView } from './lessonCamera';

export type CubeMoveAnimation = {
  move: Move;
  /** Forward applies the move; reverse undoes it visually before parent state catches up. */
  direction?: 'forward' | 'reverse';
  onComplete: () => void;
  /** After a whole-cube turn, snap orbit to lesson hold (not relative to user drag). */
  cameraAfter?: LessonCameraView;
};

type AnimatedCubeMeshProps = {
  cubeState: CubeState;
  animation: CubeMoveAnimation | null;
};

function partitionCubies(spec: MoveAnimationSpec | null) {
  if (!spec) {
    return {
      staticCubies: cubieDefinitions,
      layerCubies: [] as typeof cubieDefinitions,
    };
  }
  if (spec.kind === 'whole') {
    return {
      staticCubies: [] as typeof cubieDefinitions,
      layerCubies: cubieDefinitions,
    };
  }
  const layerCubies = cubieDefinitions.filter((c) =>
    cubieOnFaceLayer(c.position, spec.face),
  );
  const staticCubies = cubieDefinitions.filter(
    (c) => !cubieOnFaceLayer(c.position, spec.face),
  );
  return { staticCubies, layerCubies };
}

function CubieAt({
  cubeState,
  position,
}: {
  cubeState: CubeState;
  position: (typeof cubieDefinitions)[0]['position'];
}) {
  const [x, y, z] = position;
  return (
    <group position={[x, y, z]}>
      <Cubie
        position={[0, 0, 0]}
        faceColors={getCubieFaceColors(cubeState, position)}
      />
    </group>
  );
}

/**
 * Face / whole-cube turns rotate one shared group (layer turns together).
 * Static + turning groups are always mounted; only membership changes with the active move.
 */
export function AnimatedCubeMesh({
  cubeState,
  animation,
}: AnimatedCubeMeshProps) {
  const spec = animation ? getMoveAnimationSpec(animation.move) : null;
  const { staticCubies, layerCubies } = useMemo(
    () => partitionCubies(spec),
    [spec, animation?.move],
  );

  const turnRef = useRef<Group>(null);
  const progressRef = useRef(0);
  const completedRef = useRef(false);
  const activeSpecRef = useRef<MoveAnimationSpec | null>(null);

  useLayoutEffect(() => {
    progressRef.current = 0;
    completedRef.current = false;
    activeSpecRef.current = spec;
    const direction = animation?.direction ?? 'forward';
    if (!turnRef.current || !spec) return;
    const ax = axisIndex(spec.axis);
    const angle = direction === 'reverse' ? spec.angle : 0;
    turnRef.current.rotation.set(
      ax === 0 ? angle : 0,
      ax === 1 ? angle : 0,
      ax === 2 ? angle : 0,
    );
  }, [animation?.move, animation?.direction, spec, layerCubies.length]);

  useLayoutEffect(() => {
    if (animation || !turnRef.current) return;
    turnRef.current.rotation.set(0, 0, 0);
  }, [animation]);

  useFrame((_, delta) => {
    const activeSpec = activeSpecRef.current;
    if (!animation || !activeSpec || !turnRef.current || completedRef.current)
      return;

    progressRef.current = Math.min(
      1,
      progressRef.current + delta / (MOVE_ANIMATION_MS / 1000),
    );
    const t = easeInOutCubic(progressRef.current);
    const forward = (animation.direction ?? 'forward') === 'forward';
    const angle = forward ? activeSpec.angle * t : activeSpec.angle * (1 - t);
    const ax = axisIndex(activeSpec.axis);
    turnRef.current.rotation.set(
      ax === 0 ? angle : 0,
      ax === 1 ? angle : 0,
      ax === 2 ? angle : 0,
    );

    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      const isForward = (animation.direction ?? 'forward') === 'forward';
      if (!isForward) {
        turnRef.current.rotation.set(0, 0, 0);
      }
      animation.onComplete();
    }
  });

  return (
    <>
      {staticCubies.map((c) => (
        <CubieAt
          key={c.position.join(':')}
          cubeState={cubeState}
          position={c.position}
        />
      ))}
      <group ref={turnRef}>
        {layerCubies.map((c) => (
          <CubieAt
            key={c.position.join(':')}
            cubeState={cubeState}
            position={c.position}
          />
        ))}
      </group>
    </>
  );
}
