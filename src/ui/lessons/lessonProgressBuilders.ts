import type { Color, CubeState, Face } from '../../cube/cubeState';
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
  U_LAYER_EDGE_SLOTS,
  yellowStickerOnU,
  type ULayerEdgeId,
} from '../../learn/layers/lastLayer/orientEdges/uLayerEdgeModel';
import { edgePermutedAtSlot } from '../../learn/layers/lastLayer/permuteEdges/uLayerEdgePermuteModel';
import {
  cornerOrientedByIdentity,
  cornerPermutedAtSlot,
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

const U_EDGE_SIDE_FACE: Record<ULayerEdgeId, Face> = {
  UB: 'B',
  UL: 'L',
  UR: 'R',
  UF: 'F',
};

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

function uLayerEdgePartnerColor(
  studentState: CubeState,
  id: ULayerEdgeId,
): Color {
  return studentState[U_EDGE_SIDE_FACE[id]][4];
}

function uLayerCornerPartnerColors(
  studentState: CubeState,
  id: ULayerCornerId,
): readonly [Color, Color] {
  const [, colorA, colorB] = expectedULayerCornerColors(studentState, id);
  return [colorA, colorB];
}

function firstUnsolvedULayerEdge(
  studentState: CubeState,
  phase: 'orient-edges' | 'permute-edges',
): ULayerEdgeId | null {
  for (const id of U_LAYER_EDGE_SLOTS) {
    const done =
      phase === 'orient-edges'
        ? yellowStickerOnU(studentState, id)
        : edgePermutedAtSlot(studentState, id);
    if (!done) return id;
  }
  return null;
}

function firstUnsolvedULayerCorner(
  studentState: CubeState,
  phase: 'permute-corners' | 'orient-corners',
): ULayerCornerId | null {
  for (const id of U_LAYER_CORNER_SLOTS) {
    const done =
      phase === 'permute-corners'
        ? cornerPermutedAtSlot(studentState, id)
        : cornerOrientedByIdentity(studentState, id);
    if (!done) return id;
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
    return {
      key: id,
      label: id,
      solved,
      color: partnerColorForSlot(studentFrame, id),
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
    const [, colorA, colorB] = expectedCornerColors(
      studentFrame,
      id,
      holdIndex,
    );
    return {
      key: id,
      label: id,
      solved,
      colors: [colorA, colorB] as const,
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
      label: id,
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
): LessonProgressConfig {
  if (phase === 'orient-edges' || phase === 'permute-edges') {
    const currentId = firstUnsolvedULayerEdge(studentFrame, phase);
    const slots = U_LAYER_EDGE_SLOTS.map((id) => {
      const solved =
        phase === 'orient-edges'
          ? yellowStickerOnU(studentFrame, id)
          : edgePermutedAtSlot(studentFrame, id);
      return {
        key: id,
        label: id,
        solved,
        color: uLayerEdgePartnerColor(studentFrame, id),
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

  const currentId = firstUnsolvedULayerCorner(studentFrame, phase);
  const slots = U_LAYER_CORNER_SLOTS.map((id) => {
    const solved =
      phase === 'permute-corners'
        ? cornerPermutedAtSlot(studentFrame, id)
        : cornerOrientedByIdentity(studentFrame, id);
    return {
      key: id,
      label: id,
      solved,
      colors: uLayerCornerPartnerColors(studentFrame, id),
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
