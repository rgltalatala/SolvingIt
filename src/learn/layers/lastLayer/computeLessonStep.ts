import type { CubeState } from '../../../cube/cubeState';
import { isWhiteCrossComplete } from '../bottomLayer/cross/crossSlotModel';
import { isWhiteCornersComplete } from '../bottomLayer/corners/cornerSlotModel';
import { isMiddleLayerEdgesComplete } from '../middleLayer/edges/edgeSlotModel';
import {
  alignMovesForBar,
  alignMovesForLShape,
  algorithmForOrientEdgesCase,
  DOT_ALG,
} from './orientEdges/orientEdgesAlgs';
import {
  isBarAligned,
  isLShapeAligned,
  recognizeOrientEdgesCase,
} from './orientEdges/orientEdgesCases';
import { isYellowCrossComplete } from './orientEdges/uLayerEdgeModel';
import type { LastLayerLessonStep, OrientEdgesOllCase } from './types';

const COMPLETE_BODY =
  'All four top-layer edges show yellow on the U face — you have a yellow cross. Hold the cube with the blue face toward you (white on bottom, yellow on top) and confirm it matches the diagram below.';

const PREREQUISITE_BODY =
  'Finish the white cross, all four white corners, and all four middle-layer edges first. The bottom two layers must be complete before orienting the last-layer edges.';

function completeStep(): LastLayerLessonStep {
  return {
    kind: 'complete',
    title: 'Yellow cross complete',
    body: COMPLETE_BODY,
  };
}

function prerequisiteStep(): LastLayerLessonStep {
  return {
    kind: 'prerequisite',
    title: 'Complete the first two layers first',
    body: PREREQUISITE_BODY,
  };
}

function buildAlignUStep(
  ollCase: 'l-shape' | 'bar',
  alignMoves: ReturnType<typeof alignMovesForLShape>,
): LastLayerLessonStep {
  const patternLabel = ollCase === 'l-shape' ? 'L shape' : 'bar';
  const targetLabel =
    ollCase === 'l-shape'
      ? 'back and left edges (UB and UL)'
      : 'left and right edges (UL and UR)';
  return {
    kind: 'align-u',
    title: `Align the ${patternLabel}`,
    body: `Two top edges show yellow on U in a ${patternLabel} pattern. Turn the top layer (U) so those edges sit at the ${targetLabel} positions, then you can run the matching algorithm on the next step.`,
    demoMoves: alignMoves,
    ollCase,
  };
}

function buildOrientEdgesStep(
  ollCase: OrientEdgesOllCase,
  algMoves: ReturnType<typeof algorithmForOrientEdgesCase>,
): LastLayerLessonStep {
  if (ollCase === 'dot') {
    return {
      kind: 'orient-edges',
      title: 'Make the yellow cross (dot case)',
      body: 'No top edges show yellow on U yet. Run this full sequence: first the L-shape algorithm, a U turn, then the bar algorithm. Your bottom and middle layers stay intact.',
      demoMoves: algMoves,
      ollCase,
    };
  }

  if (ollCase === 'l-shape') {
    return {
      kind: 'orient-edges',
      title: 'Orient edges — L shape',
      body: 'The yellow-on-U edges are aligned at UB and UL. Run F U R U\' R\' F\' to flip the remaining edges and complete the yellow cross.',
      demoMoves: algMoves,
      ollCase,
    };
  }

  return {
    kind: 'orient-edges',
    title: 'Orient edges — bar',
    body: 'The yellow-on-U edges are aligned at UL and UR. Run F R U R\' U\' F\' to complete the yellow cross.',
    demoMoves: algMoves,
    ollCase,
  };
}

function isPrerequisiteIncomplete(studentState: CubeState): boolean {
  return (
    !isWhiteCrossComplete(studentState) ||
    !isWhiteCornersComplete(studentState) ||
    !isMiddleLayerEdgesComplete(studentState, 0)
  );
}

function computeLastLayerLessonStep(
  studentState: CubeState,
): LastLayerLessonStep {
  if (isPrerequisiteIncomplete(studentState)) {
    return prerequisiteStep();
  }

  if (isYellowCrossComplete(studentState)) {
    return completeStep();
  }

  const ollCase = recognizeOrientEdgesCase(studentState);

  if (ollCase.kind === 'dot') {
    return buildOrientEdgesStep('dot', DOT_ALG);
  }

  if (ollCase.kind === 'l-shape') {
    if (!isLShapeAligned(ollCase.slots)) {
      const alignMoves = alignMovesForLShape(ollCase.slots);
      if (alignMoves.length > 0) {
        return buildAlignUStep('l-shape', alignMoves);
      }
    }
    const algMoves = algorithmForOrientEdgesCase('l-shape');
    return buildOrientEdgesStep('l-shape', algMoves);
  }

  if (ollCase.kind === 'bar') {
    if (!isBarAligned(ollCase.slots)) {
      const alignMoves = alignMovesForBar(ollCase.slots);
      if (alignMoves.length > 0) {
        return buildAlignUStep('bar', alignMoves);
      }
    }
    const algMoves = algorithmForOrientEdgesCase('bar');
    return buildOrientEdgesStep('bar', algMoves);
  }

  return completeStep();
}

export function getLastLayerLessonStep(
  studentState: CubeState,
): LastLayerLessonStep {
  return computeLastLayerLessonStep(studentState);
}

export async function getLastLayerLessonStepAsync(
  studentState: CubeState,
): Promise<LastLayerLessonStep> {
  return computeLastLayerLessonStep(studentState);
}
