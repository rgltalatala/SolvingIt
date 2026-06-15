import type { CubiePosition } from "../../../../cube3d/cubeGeometry";
import type { CubeState, Face } from "../../../../cube/cubeState";
import {
  faceForWhiteOnCorner,
  findCornerWithColors,
} from "../shared/pieceQueries";
import {
  CORNER_SLOT_DEF,
  cornerSlotSolved,
  expectedCornerColors,
} from "./cornerSlotModel";
import { type CornerHoldIndex } from "./cornerHold";
import type { CornerSlotId } from "./types";

export type ULayerCornerId = "URF" | "UBR" | "ULB" | "UFL";

export type WrongDLayerSlotId = CornerSlotId;

export const U_LAYER_CORNER_POS: Record<ULayerCornerId, CubiePosition> = {
  URF: [1, 1, 1],
  UBR: [1, 1, -1],
  ULB: [-1, 1, -1],
  UFL: [-1, 1, 1],
};

export type CornerCase =
  | { kind: "solved" }
  | { kind: "in-slot-twisted"; whiteOnFace: Face }
  | { kind: "in-slot-other" }
  | { kind: "in-u-layer"; uPosition: ULayerCornerId }
  | { kind: "in-wrong-d-slot"; dSlot: WrongDLayerSlotId }
  | { kind: "not-in-slot" };

function positionsEqual(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function isCornerOnULayer(position: CubiePosition): boolean {
  return position[1] === 1;
}

export function isCornerOnDLayer(position: CubiePosition): boolean {
  return position[1] === -1;
}

export function uLayerCornerIdAtPosition(
  position: CubiePosition,
): ULayerCornerId | null {
  if (!isCornerOnULayer(position)) return null;
  for (const id of Object.keys(U_LAYER_CORNER_POS) as ULayerCornerId[]) {
    if (positionsEqual(position, U_LAYER_CORNER_POS[id])) return id;
  }
  return null;
}

export function dLayerCornerIdAtPosition(
  position: CubiePosition,
): CornerSlotId | null {
  if (!isCornerOnDLayer(position)) return null;
  for (const id of Object.keys(CORNER_SLOT_DEF) as CornerSlotId[]) {
    if (positionsEqual(position, CORNER_SLOT_DEF[id].pos)) return id;
  }
  return null;
}

export function findTargetCornerPiecePosition(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: CornerHoldIndex | number = 0,
): CubiePosition | null {
  const [white, colorA, colorB] = expectedCornerColors(
    studentState,
    id,
    holdIndex,
  );
  return findCornerWithColors(studentState, white, colorA, colorB);
}

export function isCornerPieceInSlot(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: CornerHoldIndex | number = 0,
): boolean {
  const position = findTargetCornerPiecePosition(studentState, id, holdIndex);
  if (!position) return false;
  return positionsEqual(position, CORNER_SLOT_DEF[id].pos);
}

/** Active corner correctly placed in the front-right (FRD) slot for the current hold. */
export function cornerSolvedInFrdView(
  studentState: CubeState,
  activeId: CornerSlotId,
  holdIndex: CornerHoldIndex | number = 0,
): boolean {
  const position = findTargetCornerPiecePosition(
    studentState,
    activeId,
    holdIndex,
  );
  if (!position || !positionsEqual(position, CORNER_SLOT_DEF.FRD.pos))
    return false;

  const slot = CORNER_SLOT_DEF.FRD;
  const [faceA, faceB] = slot.sideFaces;
  const [indexA, indexB] = slot.sideIndices;
  return (
    studentState.D[slot.dIndex] === "white" &&
    studentState[faceA][indexA] === studentState[faceA][4] &&
    studentState[faceB][indexB] === studentState[faceB][4]
  );
}

export function recognizeCornerCaseInFrdView(
  studentState: CubeState,
  activeId: CornerSlotId,
  holdIndex: CornerHoldIndex | number = 0,
): CornerCase {
  if (cornerSolvedInFrdView(studentState, activeId, holdIndex)) {
    return { kind: "solved" };
  }

  const piecePosition = findTargetCornerPiecePosition(
    studentState,
    activeId,
    holdIndex,
  );
  if (!piecePosition) {
    return { kind: "not-in-slot" };
  }

  if (isCornerOnULayer(piecePosition)) {
    const uPosition = uLayerCornerIdAtPosition(piecePosition);
    if (uPosition) {
      return { kind: "in-u-layer", uPosition };
    }
    return { kind: "not-in-slot" };
  }

  if (isCornerOnDLayer(piecePosition)) {
    const dSlot = dLayerCornerIdAtPosition(piecePosition);
    if (dSlot && dSlot !== "FRD") {
      return { kind: "in-wrong-d-slot", dSlot };
    }

    if (!positionsEqual(piecePosition, CORNER_SLOT_DEF.FRD.pos)) {
      return { kind: "not-in-slot" };
    }

    const whiteFace = faceForWhiteOnCorner(
      CORNER_SLOT_DEF.FRD.pos,
      studentState,
    );
    if (!whiteFace) {
      return { kind: "in-slot-other" };
    }

    if (whiteFace === "F" || whiteFace === "R") {
      return { kind: "in-slot-twisted", whiteOnFace: whiteFace };
    }

    return { kind: "in-wrong-d-slot", dSlot: "FRD" };
  }

  return { kind: "not-in-slot" };
}

export function recognizeCornerCase(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: CornerHoldIndex | number = 0,
): CornerCase {
  if (id === "FRD") {
    return recognizeCornerCaseInFrdView(studentState, id, holdIndex);
  }

  if (cornerSlotSolved(studentState, id)) {
    return { kind: "solved" };
  }

  const piecePosition = findTargetCornerPiecePosition(
    studentState,
    id,
    holdIndex,
  );
  if (!piecePosition) {
    return { kind: "not-in-slot" };
  }

  if (isCornerOnULayer(piecePosition)) {
    const uPosition = uLayerCornerIdAtPosition(piecePosition);
    if (uPosition) {
      return { kind: "in-u-layer", uPosition };
    }
    return { kind: "not-in-slot" };
  }

  if (isCornerOnDLayer(piecePosition)) {
    const dSlot = dLayerCornerIdAtPosition(piecePosition);
    if (dSlot && dSlot !== id) {
      return { kind: "in-wrong-d-slot", dSlot };
    }

    if (!positionsEqual(piecePosition, CORNER_SLOT_DEF[id].pos)) {
      return { kind: "not-in-slot" };
    }

    const whiteFace = faceForWhiteOnCorner(
      CORNER_SLOT_DEF[id].pos,
      studentState,
    );
    if (!whiteFace) {
      return { kind: "in-slot-other" };
    }

    const [sideA, sideB] = CORNER_SLOT_DEF[id].sideFaces;
    if (whiteFace === sideA || whiteFace === sideB) {
      return { kind: "in-slot-twisted", whiteOnFace: whiteFace };
    }

    return { kind: "in-slot-other" };
  }

  return { kind: "not-in-slot" };
}
