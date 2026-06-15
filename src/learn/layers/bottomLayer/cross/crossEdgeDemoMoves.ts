import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import { findVerifiedSlotDemoForPartner } from './crossSolveBfs';

/**
 * Verified demo for solve-edge fallback: always slots this partner's cross edge
 * while preserving other solved cross slots (BFS with expanded search if needed).
 */
export function crossEdgeExampleDemoMoves(
  state: CubeState,
  partner: Color,
): Move[] {
  const demo = findVerifiedSlotDemoForPartner(state, partner);
  if (!demo?.length) {
    throw new Error(`No verified cross-slot demo for white–${partner} edge`);
  }
  return demo;
}
