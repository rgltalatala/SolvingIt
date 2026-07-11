import type { CubeState } from '../../cube/cubeState';
import {
  edgeProgressLabel,
  whiteCornerProgressLabel,
  whiteEdgeProgressLabel,
  yellowCornerProgressLabel,
  yellowEdgeProgressLabel,
} from '../../content/pieceIdentity';
import {
  activeCornerId,
  CORNER_ORDER,
  cornerSlotSolved,
  expectedCornerColors,
  normalizeHoldToBlue,
  type CornerSlotId,
} from '../../learn/layers/bottomLayer/corners';
import {
  CROSS_ORDER,
  firstUnsolvedCrossId,
  partnerColorForSlot,
  slotSolved,
} from '../../learn/layers/bottomLayer/cross/crossSlotModel';
import {
  edgeOrientedByIdentity,
  expectedULayerEdgePartner,
  U_LAYER_EDGE_SLOTS,
  type ULayerEdgeId,
} from '../../learn/layers/lastLayer/orientEdges/uLayerEdgeModel';
import { edgePermutedByIdentity } from '../../learn/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';
import {
  cornerOrientedByIdentity,
  cornerPermutedByIdentity,
  expectedULayerCornerColors,
  U_LAYER_CORNER_SLOTS,
} from '../../learn/layers/lastLayer/permuteCorners/uLayerCornerPermuteModel';
import {
  edgeSlotSolved,
  expectedEdgeColorsForSlot,
  pickActiveUnsolvedEdge,
} from '../../learn/layers/middleLayer/edges/edgeSlotModel';
import type { ULayerCornerId } from '../../learn/layers/bottomLayer/corners/cornerCases';
import type { MiddleEdgeSlotId } from '../../learn/layers/middleLayer/edges/types';
import type { LessonProgressConfig } from './LessonProgress';

const MIDDLE_SLOT_ORDER: MiddleEdgeSlotId[] = ['FR', 'BR', 'BL', 'FL'];

export type LastLayerProgressPhase =
  | 'orient-edges'
  | 'permute-edges'
  | 'permute-corners'
  | 'orient-corners';

function cornerSlotDone(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: number,
  solvedCornerIds: readonly CornerSlotId[],
): boolean {
  if (solvedCornerIds.includes(id)) return true;
  return cornerSlotSolved(normalizeHoldToBlue(studentState, holdIndex), id);
}

function middleSlotDone(
  studentState: CubeState,
  id: MiddleEdgeSlotId,
  holdIndex: number,
  solvedMiddleEdgeSlots: readonly MiddleEdgeSlotId[],
): boolean {
  if (solvedMiddleEdgeSlots.includes(id)) return true;
  return edgeSlotSolved(studentState, id, holdIndex);
}

function uLayerEdgeDone(
  ref: CubeState,
  id: ULayerEdgeId,
  phase: 'orient-edges' | 'permute-edges',
): boolean {
  return phase === 'orient-edges'
    ? edgeOrientedByIdentity(ref, id)
    : edgePermutedByIdentity(ref, id);
}

function uLayerCornerDone(
  ref: CubeState,
  id: ULayerCornerId,
  phase: 'permute-corners' | 'orient-corners',
): boolean {
  return phase === 'permute-corners'
    ? cornerPermutedByIdentity(ref, id)
    : cornerOrientedByIdentity(ref, id);
}

function firstUnsolvedULayerEdge(
  ref: CubeState,
  phase: 'orient-edges' | 'permute-edges',
): ULayerEdgeId | null {
  for (const id of U_LAYER_EDGE_SLOTS) {
    if (!uLayerEdgeDone(ref, id, phase)) return id;
  }
  return null;
}

function firstUnsolvedULayerCorner(
  ref: CubeState,
  phase: 'permute-corners' | 'orient-corners',
): ULayerCornerId | null {
  for (const id of U_LAYER_CORNER_SLOTS) {
    if (!uLayerCornerDone(ref, id, phase)) return id;
  }
  return null;
}

export function crossLessonProgress(
  studentFrame: CubeState,
  progressLabel: (solved: number) => string,
): LessonProgressConfig {
  const currentId = firstUnsolvedCrossId(studentFrame);
  const slots = CROSS_ORDER.map((id) => {
    const solved = slotSolved(studentFrame, id);
    const partner = partnerColorForSlot(studentFrame, id);
    return {
      key: id,
      label: whiteEdgeProgressLabel(partner),
      solved,
      colors: ['white', partner] as const,
      isCurrent: !solved && id === currentId,
    };
  });
  const solved = slots.filter((slot) => slot.solved).length;

  return {
    solved,
    total: CROSS_ORDER.length,
    slots,
    ariaLabel: progressLabel(solved),
  };
}

export function cornersLessonProgress(
  studentFrame: CubeState,
  holdIndex: number,
  solvedCornerIds: readonly CornerSlotId[],
  progressLabel: (solved: number) => string,
): LessonProgressConfig {
  const currentId = activeCornerId(studentFrame, holdIndex, solvedCornerIds);
  const slots = CORNER_ORDER.map((id) => {
    const solved = cornerSlotDone(
      studentFrame,
      id,
      holdIndex,
      solvedCornerIds,
    );
    const [white, colorA, colorB] = expectedCornerColors(
      studentFrame,
      id,
      holdIndex,
    );
    return {
      key: id,
      label: whiteCornerProgressLabel(colorA, colorB),
      solved,
      colors: [white, colorA, colorB] as const,
      isCurrent: !solved && id === currentId,
    };
  });
  const solved = slots.filter((slot) => slot.solved).length;

  return {
    solved,
    total: CORNER_ORDER.length,
    slots,
    ariaLabel: progressLabel(solved),
  };
}

export function middleLayerLessonProgress(
  studentFrame: CubeState,
  holdIndex: number,
  solvedMiddleEdgeSlots: readonly MiddleEdgeSlotId[],
  progressLabel: (solved: number) => string,
): LessonProgressConfig {
  const active = pickActiveUnsolvedEdge(studentFrame, holdIndex);
  const currentId = active?.slotId ?? null;
  const slots = MIDDLE_SLOT_ORDER.map((id) => {
    const solved = middleSlotDone(
      studentFrame,
      id,
      holdIndex,
      solvedMiddleEdgeSlots,
    );
    const colors = expectedEdgeColorsForSlot(studentFrame, id, holdIndex);
    return {
      key: id,
      label: edgeProgressLabel(colors[0], colors[1]),
      solved,
      colors,
      isCurrent: !solved && id === currentId,
    };
  });
  const solved = slots.filter((slot) => slot.solved).length;

  return {
    solved,
    total: MIDDLE_SLOT_ORDER.length,
    slots,
    ariaLabel: progressLabel(solved),
  };
}

export function lastLayerLessonProgress(
  studentFrame: CubeState,
  phase: LastLayerProgressPhase,
  progressLabel: (solved: number) => string,
  holdIndex = 0,
): LessonProgressConfig {
  // Blue-front + piece identity keeps subsection order stable across y holds and U turns.
  const ref = normalizeHoldToBlue(studentFrame, holdIndex);

  if (phase === 'orient-edges' || phase === 'permute-edges') {
    const currentId = firstUnsolvedULayerEdge(ref, phase);
    const slots = U_LAYER_EDGE_SLOTS.map((id) => {
      const solved = uLayerEdgeDone(ref, id, phase);
      const partner = expectedULayerEdgePartner(ref, id);
      return {
        key: id,
        label: yellowEdgeProgressLabel(partner),
        solved,
        colors: ['yellow', partner] as const,
        isCurrent: !solved && id === currentId,
      };
    });
    const solved = slots.filter((slot) => slot.solved).length;
    return {
      solved,
      total: U_LAYER_EDGE_SLOTS.length,
      slots,
      ariaLabel: progressLabel(solved),
    };
  }

  const currentId = firstUnsolvedULayerCorner(ref, phase);
  const slots = U_LAYER_CORNER_SLOTS.map((id) => {
    const solved = uLayerCornerDone(ref, id, phase);
    const [yellow, colorA, colorB] = expectedULayerCornerColors(ref, id);
    return {
      key: id,
      label: yellowCornerProgressLabel(colorA, colorB),
      solved,
      colors: [yellow, colorA, colorB] as const,
      isCurrent: !solved && id === currentId,
    };
  });
  const solved = slots.filter((slot) => slot.solved).length;

  return {
    solved,
    total: U_LAYER_CORNER_SLOTS.length,
    slots,
    ariaLabel: progressLabel(solved),
  };
}
