import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { isWholeCubeRotation } from '../../../../cube/cubeState';
import { isVerifiedCornerSlotDemo } from './preserveLessonState';
import type { CornerSlotId } from './types';
import {
  setupMovesForWrongDSlotInHoldView,
  setupMovesForWrongDSlotStorage,
} from './wrongDLayerSteps';
import { U_LAYER_U_PREFIXES } from './uLayerSteps';
import { CORNER_ORDER } from './types';

/**
 * Cube state for FRD-view case recognition. Reorient steps bake y into the cube;
 * only optional U-layer prefixes are applied here.
 */
export function studentHoldView(
  studentState: CubeState,
  _holdIndex: number,
  uPrefix: Move[] = [],
): CubeState {
  return uPrefix.length ? applyMoves(studentState, uPrefix) : studentState;
}

/** True when every move is a face turn (no whole-cube y rotations). */
export function isStudentFacingDemo(demo: readonly Move[]): boolean {
  return demo.length > 0 && !demo.some(isWholeCubeRotation);
}

function inferWrongDStorageCandidates(
  studentDemo: Move[],
  holdIndex: number,
): Move[][] {
  if (holdIndex !== 0) return [];
  const candidates: Move[][] = [];
  for (const dSlot of CORNER_ORDER) {
    if (dSlot === 'FRD') continue;
    const setupView = setupMovesForWrongDSlotInHoldView(dSlot);
    const setupStorage = setupMovesForWrongDSlotStorage(dSlot);
    for (const uPrefix of U_LAYER_U_PREFIXES) {
      const prefix = [...uPrefix, ...setupView];
      if (prefix.length > studentDemo.length) continue;
      if (!prefix.every((move, index) => studentDemo[index] === move)) continue;
      candidates.push([
        ...uPrefix,
        ...setupStorage,
        ...studentDemo.slice(prefix.length),
      ]);
    }
  }
  return candidates;
}

/** Resolve the storage-frame demo that verifies for apply / undo. */
export function resolveLessonStorageDemo(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
  studentDemo: Move[],
  solvedCornerIds?: readonly CornerSlotId[],
  storageCandidates: readonly Move[][] = [],
): Move[] | null {
  const candidates: Move[][] = [
    ...storageCandidates,
    ...inferWrongDStorageCandidates(studentDemo, holdIndex),
    studentDemo,
  ];

  const seen = new Set<string>();
  for (const demo of candidates) {
    if (!demo.length) continue;
    const key = demo.join(' ');
    if (seen.has(key)) continue;
    seen.add(key);
    if (
      isVerifiedCornerSlotDemo(
        studentState,
        targetId,
        demo,
        holdIndex,
        solvedCornerIds,
      )
    ) {
      return demo;
    }
  }
  return null;
}

/**
 * Verify a face-turn demo for the current lesson hold. Reorient steps bake y into
 * the storage cube, so the planner always returns student-facing sequences; apply
 * resolves storage-frame variants separately via {@link resolveLessonStorageDemo}.
 */
export function verifiedFrdDemoAtHold(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
  studentDemo: Move[],
  solvedCornerIds?: readonly CornerSlotId[],
  storageCandidates: readonly Move[][] = [],
): Move[] | null {
  if (!studentDemo.length || !isStudentFacingDemo(studentDemo)) return null;

  const studentVerifies = isVerifiedCornerSlotDemo(
    studentState,
    targetId,
    studentDemo,
    holdIndex,
    solvedCornerIds,
  );
  const storageDemo = resolveLessonStorageDemo(
    studentState,
    targetId,
    holdIndex,
    studentDemo,
    solvedCornerIds,
    storageCandidates,
  );

  if (!studentVerifies && !storageDemo) return null;

  return studentDemo;
}
