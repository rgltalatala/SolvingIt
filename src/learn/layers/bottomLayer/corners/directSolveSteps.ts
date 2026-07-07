import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import { whiteCornersSteps, formatCornerLabel } from '../../../../content/whiteCorners';
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import { recognizeCornerCaseInFrdView } from './cornerCases';
import { demoChangesState } from '../../../lessonCore';
import { verifiedFrdDemoAtHold, studentHoldView } from './frdViewDemoBuild';
import type { CornerSlotId, WhiteCornersLessonStep } from './types';
import { buildFrdULayerDemo, uLayerInsertStepBody } from './uLayerSteps';
import { buildFrdWrongDLayerDemo, wrongDSlotStepBody } from './wrongDLayerSteps';
import { U_LAYER_U_PREFIXES } from './uLayerSteps';

export const FRD_WHITE_ON_F: Move[] =
  parseFaceTurnAlgToMoves("R U' R' U R U' R'");
export const FRD_WHITE_ON_R: Move[] =
  parseFaceTurnAlgToMoves("R U R' U' R U R'");

const FRD_TWIST_FALLBACK_DEMOS: Move[][] = [
  FRD_WHITE_ON_F,
  FRD_WHITE_ON_R,
  parseFaceTurnAlgToMoves("R U R' R U' R'"),
  [...FRD_WHITE_ON_R, ...FRD_WHITE_ON_F],
  [...FRD_WHITE_ON_F, ...FRD_WHITE_ON_R],
];

type TwistDemoMatch = {
  demo: Move[];
  whiteOnFace: Face;
};

function demoForFrdTwist(whiteOnFace: Face): Move[] | null {
  if (whiteOnFace === 'F') return FRD_WHITE_ON_F;
  if (whiteOnFace === 'R') return FRD_WHITE_ON_R;
  return null;
}

function twistAlgsForCase(whiteOnFace: Face): Move[][] {
  return [
    demoForFrdTwist(whiteOnFace),
    whiteOnFace === 'F' ? FRD_WHITE_ON_R : FRD_WHITE_ON_F,
  ].filter((demo): demo is Move[] => !!demo?.length);
}

function searchTwistDemos(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: number,
  solvedCornerIds: readonly CornerSlotId[] | undefined,
  options: { useFallback: boolean; requireTwistedCase: boolean },
): TwistDemoMatch[] {
  const found: TwistDemoMatch[] = [];
  const twistSets = options.useFallback ? FRD_TWIST_FALLBACK_DEMOS : null;

  for (const uPrefix of U_LAYER_U_PREFIXES) {
    const viewState = studentHoldView(studentState, holdIndex, uPrefix);
    const cornerCase = recognizeCornerCaseInFrdView(viewState, id, holdIndex);

    const twists =
      twistSets ??
      (cornerCase.kind === 'in-slot-twisted'
        ? twistAlgsForCase(cornerCase.whiteOnFace)
        : []);

    if (options.requireTwistedCase && cornerCase.kind !== 'in-slot-twisted') {
      continue;
    }

    for (const twist of twists) {
      const demo = verifiedFrdDemoAtHold(
        studentState,
        id,
        holdIndex,
        [...uPrefix, ...twist],
        solvedCornerIds,
      );
      if (!demo) continue;
      const whiteOnFace =
        cornerCase.kind === 'in-slot-twisted' ? cornerCase.whiteOnFace : 'F';
      found.push({ demo, whiteOnFace });
    }
  }

  return found;
}

function buildTwistedInSlotStep(
  _studentState: CubeState,
  cornerId: CornerSlotId,
  _whiteOnFace: Face,
  demo: Move[],
): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: whiteCornersSteps.twisted(formatCornerLabel(cornerId)),
    demoMoves: demo,
  };
}

function buildULayerInsertStep(
  cornerId: CornerSlotId,
  demo: Move[],
): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: uLayerInsertStepBody(cornerId, demo),
    demoMoves: demo,
  };
}

function buildWrongDLayerStep(
  cornerId: CornerSlotId,
  demo: Move[],
): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: wrongDSlotStepBody(cornerId, demo),
    demoMoves: demo,
  };
}

function buildGenericSolveStep(
  cornerId: CornerSlotId,
  demo: Move[],
): WhiteCornersLessonStep {
  return {
    kind: 'solve-corner',
    cornerId,
    title: formatCornerLabel(cornerId),
    body: whiteCornersSteps.directSolve(formatCornerLabel(cornerId)),
    demoMoves: demo,
  };
}

export function tryFrdTwistedInSlot(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const match = searchTwistDemos(studentState, id, holdIndex, solvedCornerIds, {
    useFallback: false,
    requireTwistedCase: true,
  })[0];
  if (!match) return null;
  return buildTwistedInSlotStep(
    studentState,
    id,
    match.whiteOnFace,
    match.demo,
  );
}

export function tryFrdULayerInsert(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const demo = buildFrdULayerDemo(
    studentState,
    'URF',
    id,
    holdIndex,
    solvedCornerIds,
  );
  if (!demo?.length) return null;

  return buildULayerInsertStep(id, demo);
}

export function tryFrdWrongDLayerExtract(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const demo = buildFrdWrongDLayerDemo(
    studentState,
    'FRD',
    id,
    holdIndex,
    solvedCornerIds,
  );
  if (!demo?.length) return null;

  return buildWrongDLayerStep(id, demo);
}

function shortestVerifiedDemo(
  candidates: (Move[] | null | undefined)[],
): Move[] | null {
  let best: Move[] | null = null;
  for (const demo of candidates) {
    if (!demo?.length) continue;
    if (!best || demo.length < best.length) best = demo;
  }
  return best;
}

function collectShortestFixedDemo(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[] | null {
  const twistDemos = [
    ...searchTwistDemos(studentState, id, holdIndex, solvedCornerIds, {
      useFallback: false,
      requireTwistedCase: true,
    }),
    ...searchTwistDemos(studentState, id, holdIndex, solvedCornerIds, {
      useFallback: true,
      requireTwistedCase: false,
    }),
  ].map((match) => match.demo);

  return shortestVerifiedDemo(
    [
      buildFrdULayerDemo(studentState, 'URF', id, holdIndex, solvedCornerIds),
      buildFrdWrongDLayerDemo(
        studentState,
        'FRD',
        id,
        holdIndex,
        solvedCornerIds,
      ),
      ...twistDemos,
    ].filter((demo): demo is Move[] => !!demo?.length),
  );
}

function demosEqual(a: readonly Move[], b: readonly Move[]): boolean {
  return a.length === b.length && a.every((move, index) => move === b[index]);
}

function buildStepForDemo(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: number,
  demo: Move[],
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep {
  const uDemo = buildFrdULayerDemo(
    studentState,
    'URF',
    id,
    holdIndex,
    solvedCornerIds,
  );
  if (uDemo && demosEqual(uDemo, demo)) return buildULayerInsertStep(id, demo);

  const wDemo = buildFrdWrongDLayerDemo(
    studentState,
    'FRD',
    id,
    holdIndex,
    solvedCornerIds,
  );
  if (wDemo && demosEqual(wDemo, demo)) return buildWrongDLayerStep(id, demo);

  const twistMatch = [
    ...searchTwistDemos(studentState, id, holdIndex, solvedCornerIds, {
      useFallback: false,
      requireTwistedCase: true,
    }),
    ...searchTwistDemos(studentState, id, holdIndex, solvedCornerIds, {
      useFallback: true,
      requireTwistedCase: false,
    }),
  ].find((match) => demosEqual(match.demo, demo));

  if (twistMatch) {
    return buildTwistedInSlotStep(
      studentState,
      id,
      twistMatch.whiteOnFace,
      demo,
    );
  }

  return buildGenericSolveStep(id, demo);
}

export function tryDirectSolveStepForCornerId(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): WhiteCornersLessonStep | null {
  const fixedDemo = collectShortestFixedDemo(
    studentState,
    id,
    holdIndex,
    solvedCornerIds,
  );
  if (!fixedDemo?.length || !demoChangesState(studentState, fixedDemo))
    return null;
  return buildStepForDemo(
    studentState,
    id,
    holdIndex,
    fixedDemo,
    solvedCornerIds,
  );
}
